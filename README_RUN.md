# Gu?a de Ejecuci?n y Pruebas Multi-Servicio: EduGrade AI

Esta gu?a proporciona las instrucciones completas paso a paso para iniciar y probar todos los componentes del ecosistema **EduGrade AI** (Backend Django ASGI + Channels, Frontend Next.js 15 App Router y Mobile Flutter Scanner).

---

## 1. Requisitos Previos

- **Python:** 3.10+ instalado.
- **Node.js:** 18.x o 20.x+ y npm/pnpm.
- **Flutter SDK:** 3.x+ (con Android Studio o Xcode para emulador/dispositivo).
- **PostgreSQL & Redis:** (Opcional, el backend incluye fallback autom?tico a SQLite y Channel Layer en memoria para desarrollo local ?gil).
- **Google Gemini API Key:** Obtenerla gratuitamente en [Google AI Studio](https://aistudio.google.com/).

---

## 2. Puesta en Marcha del Backend (Django REST + Channels + Gemini)

### Paso 2.1: Crear y activar entorno virtual
```bash
cd backend
python -m venv venv

# En Windows PowerShell:
.\venv\Scripts\Activate.ps1

# En Linux / macOS:
source venv/bin/activate
```

### Paso 2.2: Instalar dependencias
```bash
pip install -r requirements.txt
```

### Paso 2.3: Configurar variables de entorno
Edita el archivo `backend/.env` o config?ralo con tu API Key de Gemini:
```env
DEBUG=True
SECRET_KEY=django-insecure-edugrade-ai-super-secret-key-2026
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Base de datos (Por defecto SQLite local r?pido, o PostgreSQL)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# Gemini API Key de Google
GEMINI_API_KEY=AIzaSy...Tu_Clave_Aqui
```

### Paso 2.4: Ejecutar migraciones y crear datos iniciales
```bash
python manage.py makemigrations
python manage.py migrate

# Crear superusuario para el panel administrativo (ej: admin / admin123)
python manage.py createsuperuser
```

### Paso 2.5: Iniciar Servidor ASGI con Daphne (WebSockets + HTTP)
```bash
# Iniciar con daphne en puerto 8000
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```
El backend estar? escuchando en:
- **API REST & Media:** `http://localhost:8000/api/`
- **Swagger UI:** `http://localhost:8000/api/docs/`
- **Django Admin:** `http://localhost:8000/admin/`
- **WebSocket Canal Live:** `ws://localhost:8000/ws/exams/live/`

---

## 3. Puesta en Marcha del Frontend (Next.js 15 Dashboard)

### Paso 3.1: Instalar dependencias
```bash
cd frontend
npm install
```

### Paso 3.2: Verificar variables de entorno (`.env.local`)
Aseg?rate de que `frontend/.env.local` contenga:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/exams/live/
```

### Paso 3.3: Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador: **`http://localhost:3000`** para interactuar con el **Split-Screen Dashboard en tiempo real**.

---

## 4. Puesta en Marcha de la App M?vil (Flutter Scanner)

### Paso 4.1: Instalar dependencias
```bash
cd mobile
flutter pub get
```

### Paso 4.2: Configurar IP de Red Local (Para dispositivo f?sico)
Si vas a probar la app en un tel?fono f?sico conectado por USB o WiFi:
1. Averigua la IP local de tu PC ejecutando `ipconfig` (Windows) o `ifconfig` (Mac/Linux), ej: `192.168.1.45`.
2. En `mobile/lib/core/constants/api_constants.dart`, actualiza `baseUrl` y `wsUrl` a tu IP local `http://192.168.1.45:8000/api`.
3. *(Si usas el emulador de Android oficial, `10.0.2.2:8000` ya viene preconfigurado y funciona por defecto)*.

### Paso 4.3: Ejecutar en Emulador o Dispositivo
```bash
flutter run
```

---

## 5. Prueba de Flujo Extremo a Extremo (Simulaci?n r?pida con cURL)

Para probar la recepci?n en vivo en el Dashboard de Next.js sin necesidad de abrir la app de Flutter:

1. Ten abierto `http://localhost:3000` en tu navegador.
2. Crea primero un curso y plantilla desde Django Admin (`http://localhost:8000/admin/`) o mediante este comando:
```bash
# Crear un curso de prueba
curl -X POST http://localhost:8000/api/exams/courses/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Matem?tica Aplicada", "code": "MAT-101", "description": "Curso b?sico"}'

# Crear una plantilla de examen
curl -X POST http://localhost:8000/api/exams/templates/ \
  -H "Content-Type: application/json" \
  -d '{"course": 1, "title": "Examen Parcial I", "total_max_score": "20.00", "is_active": true}'

# Crear un criterio de pregunta
curl -X POST http://localhost:8000/api/exams/questions/ \
  -H "Content-Type: application/json" \
  -d '{"exam_template": 1, "question_number": 1, "question_type": "LONG_ANSWER", "question_text": "Explique el teorema de Bayes y su f?rmula.", "expected_answer_or_rubric": "Debe definir probabilidad condicional, P(A|B) = [P(B|A)*P(A)]/P(B) y dar un ejemplo.", "max_score": "10.00"}'
```

3. Simula la subida de una foto de examen (reemplaza `sample_exam.jpg` por cualquier imagen):
```bash
curl -X POST http://localhost:8000/api/evaluations/submissions/upload/ \
  -F "exam_template_id=1" \
  -F "exam_image=@sample_exam.jpg"
```

4. Observa c?mo inmediatamente el navegador en `http://localhost:3000` recibe el evento v?a WebSocket, renderiza el examen en el panel izquierdo y la calificaci?n detallada generada por **Gemini 2.5 Flash** en el panel derecho.
