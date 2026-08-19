# Interfaces de Visualización y Pruebas del Backend

Este documento detalla las interfaces visuales disponibles en el backend de Django para explorar la base de datos, administrar los registros y probar los endpoints de la API en tiempo real.

---

## 1. Panel de Administración de Django (Django Admin)

El **Django Admin** es una herramienta integrada muy potente que genera una interfaz web automática para realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar) sobre todos los modelos de la base de datos (Cursos, Plantillas, Evaluaciones, etc.).

* **URL de Acceso:** `http://localhost:8000/admin/`

### 🔑 Cómo crear credenciales de acceso:
Para poder ingresar, necesitas una cuenta con permisos de administrador (superusuario). Ejecútalo en tu consola con el entorno virtual activo:

```bash
python manage.py createsuperuser
```

Sigue las indicaciones en pantalla:
1. **Username**: Define tu nombre de usuario (ej. `admin`).
2. **Email address**: Tu correo electrónico.
3. **Password**: Define una contraseña segura (se ocultará al escribir).
4. **Confirm Password**: Confirma la contraseña.

Una vez creado, ingresa a la URL en tu navegador e inicia sesión con estas credenciales.

---

## 2. Documentación Interactiva de la API (Swagger UI)

Gracias a la integración de **`drf-spectacular`**, el proyecto autogenera un esquema OpenAPI 3.0 que se traduce en una interfaz interactiva donde puedes explorar detalladamente cada endpoint de la API, ver los parámetros esperados, el formato de respuesta y probar llamadas en vivo directamente desde tu navegador.

* **URL de Acceso Principal (Recomendado):** `http://localhost:8000/api/docs/`
* **URL de Acceso Alternativa:** `http://localhost:8000/api/schema/swagger-ui/`

### 🛠️ Cómo utilizar Swagger:
1. Haz clic sobre cualquiera de los bloques de endpoints (ej. `/api/exams/courses/`).
2. Presiona el botón **"Try it out"** (Probar) en la esquina superior derecha del bloque.
3. Rellena los parámetros necesarios (si aplica) y haz clic en el botón azul grande **"Execute"** (Ejecutar).
4. Verás el comando `curl` generado, la URL llamada y la respuesta real del servidor con el código de estado HTTP (ej. `200 OK`) y los datos JSON correspondientes.

---

## 3. Documentación Alternativa (Redoc)

Si prefieres una lectura de documentación más limpia, estática y ordenada (especialmente útil para lectura y consulta de diseño de contratos de API sin probar peticiones en vivo), puedes acceder a la interfaz de Redoc.

* **URL de Acceso:** `http://localhost:8000/api/redoc/`
