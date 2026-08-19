# Historial de Comandos de Scaffolding y Construcci?n: EduGrade AI

Este documento recopila la secuencia exacta de comandos de terminal utilizados para crear y estructurar los tres sub-proyectos del workspace (**Backend**, **Frontend** y **Mobile**).

---

## 1. Comandos de Scaffolding del Backend (Django REST + Channels)

```bash
# 1. Crear directorio del backend y entorno virtual
mkdir backend
cd backend
python -m venv venv

# 2. Activar entorno virtual
# En Windows:
.\venv\Scripts\Activate.ps1
# En Linux/Mac:
source venv/bin/activate

# 3. Instalar librer?as principales
pip install django djangorestframework django-cors-headers channels[daphne] channels-redis psycopg2-binary python-environ google-genai drf-spectacular pillow

# 4. Congelar dependencias
pip freeze > requirements.txt

# 5. Inicializar proyecto Django y Aplicaciones modulares
django-admin startproject config .
mkdir apps
mkdir apps/core apps/exams apps/evaluations
mkdir apps/evaluations/services

# 6. Generar migraciones iniciales de la base de datos
python manage.py makemigrations core exams evaluations
python manage.py migrate

# 7. Crear superusuario administrativo
python manage.py createsuperuser

# 8. Iniciar servidor ASGI para desarrollo
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

---

## 2. Comandos de Scaffolding del Frontend (Next.js 15 App Router + Tailwind)

```bash
# 1. Crear proyecto Next.js con TypeScript, Tailwind CSS y App Router
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

# 2. Navegar al frontend e instalar dependencias adicionales
cd frontend
npm install axios lucide-react clsx tailwind-merge

# 3. Instalar tipos de desarrollo
npm install -D @types/node @types/react @types/react-dom

# 4. Iniciar servidor de desarrollo de Next.js
npm run dev
```

---

## 3. Comandos de Scaffolding de la App M?vil (Flutter Scanner)

```bash
# 1. Crear proyecto Flutter
flutter create --org com.edugrade --project-name edugrade_mobile mobile

# 2. Navegar al proyecto m?vil
cd mobile

# 3. Agregar paquetes y dependencias clave
flutter pub add camera permission_handler dio web_socket_channel http_parser path_provider cupertino_icons

# 4. Obtener dependencias
flutter pub get

# 5. Verificar configuraci?n de dispositivos disponibles
flutter devices

# 6. Ejecutar en emulador o dispositivo f?sico conectado
flutter run
```

---

## 4. Estructura Final del Workspace Resultante

```text
edugrade-ai/
??? README_COMMANDS.md            # Historial de comandos de creaci?n
??? README_RUN.md                 # Gu?a de ejecuci?n multi-servicio
??? backend/                      # Django + Channels + PostgreSQL + Gemini 2.5 Flash
?   ??? manage.py
?   ??? requirements.txt
?   ??? .env.example / .env
?   ??? README_DATA_MODEL.md
?   ??? README_ROUTING_SWAGGER.md
?   ??? config/ (settings.py, urls.py, asgi.py, wsgi.py)
?   ??? apps/
?       ??? core/ (models.py, views.py)
?       ??? exams/ (models.py, serializers.py, views.py, urls.py, admin.py)
?       ??? evaluations/ (models.py, serializers.py, views.py, urls.py, consumers.py, routing.py, admin.py, services/)
??? frontend/                     # Next.js 15 (App Router) + Tailwind CSS + WebSockets
?   ??? package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
?   ??? .env.local.example / .env.local
?   ??? src/
?       ??? app/ (layout.tsx, page.tsx, globals.css, exams/page.tsx)
?       ??? components/ (ui/, dashboard/, scanner-feed/)
?       ??? services/ (api.ts)
?       ??? types/ (index.ts)
?       ??? hooks/ (useWebSocket.ts)
??? mobile/                       # Flutter Scanner (Android / iOS)
    ??? pubspec.yaml
    ??? android/app/src/main/AndroidManifest.xml (Permisos CAMERA e INTERNET)
    ??? ios/Runner/Info.plist (NSCameraUsageDescription)
    ??? lib/
        ??? main.dart
        ??? core/ (constants/, network/, theme/)
        ??? features/ (scanner/, websocket/)
```
