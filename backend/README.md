# EduGrade AI - Django Backend Setup & Commands

Este archivo contiene la guía rápida de instalación, configuración y los comandos esenciales para levantar y administrar el backend del proyecto.

---

## 🚀 1. Configuración Inicial (Setup)

### Paso 1: Crear el entorno virtual (`venv`)
Posiciónate en la carpeta raíz del backend y crea el entorno virtual de Python:

```bash
python -m venv venv
```

### Paso 2: Activar el entorno virtual

* **En Git Bash / Linux / macOS**:
  ```bash
  source ./venv/Scripts/activate
  ```
* **En Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **En Windows (CMD / Símbolo del Sistema)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```

### Paso 3: Instalar las dependencias
Con el entorno virtual activo `(venv)`, instala los paquetes requeridos:

```bash
pip install -r requirements.txt
```

### Paso 4: Variables de entorno (`.env`)
1. Copia el archivo de plantilla para crear tu entorno local:
   ```bash
   cp .env.example .env
   ```
2. Abre el archivo `.env` y configura tus credenciales locales (especialmente tu base de datos de PostgreSQL y la API Key de Gemini: `GEMINI_API_KEY`).

---

## 🗄️ 2. Migraciones de Base de Datos

Cada vez que hagas cambios en los archivos `models.py` de las aplicaciones Django o necesites inicializar la base de datos por primera vez:

### Detectar y crear archivos de migración:
```bash
python manage.py makemigrations
```

### Aplicar las migraciones a la Base de Datos:
```bash
python manage.py migrate
```

---

## 🖥️ 3. Levantar el Servidor de Desarrollo

Ejecuta el servidor ASGI/Daphne para habilitar tanto HTTP como WebSockets en tiempo real:

```bash
python manage.py runserver 0.0.0.0:8000
```
* **Daphne** levantará por defecto el servicio en el puerto `8000`.

---

## 🛠️ 4. Comandos Útiles e Interesantes en Django

### Crear un Administrador (Superusuario)
Para poder ingresar al panel de administración de Django (`http://localhost:8000/admin/`):
```bash
python manage.py createsuperuser
```

### Crear una Nueva Aplicación (Modulo/App)
Crea una nueva estructura de carpetas estructurada para un nuevo módulo:
```bash
python manage.py startapp nombre_de_la_app
```

### Consola Interactiva de Python (Django Shell)
Para probar código Python interactuando directamente con tus modelos y base de datos:
```bash
python manage.py shell
```

### Revertir Migraciones Específicas
Para deshacer migraciones en una aplicación específica hasta un número determinado (por ejemplo, revertir hasta la migración `0002`):
```bash
python manage.py migrate nombre_app 0002
```

### Mostrar el Mapa de URLs (Routes)
Si tienes instalado `django-extensions` o quieres inspeccionar rutas:
```bash
python manage.py show_urls
```

### Limpiar Datos / Vaciar Base de Datos
Vacía por completo todas las tablas de la base de datos manteniendo la estructura:
```bash
python manage.py flush
```
