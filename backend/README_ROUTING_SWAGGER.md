# Gu?a de Enrutamiento, Swagger OpenAPI y Django Admin (EduGrade AI)

Este documento detalla todas las rutas RESTful disponibles en el backend Django, la documentaci?n interactiva OpenAPI/Swagger UI y el panel administrativo.

---

## 1. Documentaci?n Interactiva OpenAPI / Swagger

EduGrade AI utiliza `drf-spectacular` para autogenerar la especificaci?n OpenAPI 3.0 con interfaz Swagger UI y ReDoc.

| Interfaz | URL | Descripci?n |
| :--- | :--- | :--- |
| **Swagger UI** | `http://localhost:8000/api/docs/` | Explorador interactivo de endpoints, schemas y ejecutor de peticiones REST en vivo. |
| **Swagger UI Alt** | `http://localhost:8000/api/schema/swagger-ui/` | Ruta alternativa compatible con est?ndares OpenAPI. |
| **ReDoc** | `http://localhost:8000/api/redoc/` | Documentaci?n estructurada visual de la API. |
| **OpenAPI JSON/YAML Schema** | `http://localhost:8000/api/schema/` | Especificaci?n cruda para clientes generadores de SDKs. |

---

## 2. Django Admin (Visual Data Studio)

Similar a Prisma Studio en el ecosistema Node.js, el **Django Admin** permite visualizar, editar, filtrar y gestionar todos los registros relacionales en tiempo real.

- **URL:** `http://localhost:8000/admin/`
- **Modelos registrados con tablas inline:**
  - `Cursos` (Visualizaci?n de profesores y plantillas)
  - `Plantillas de Ex?menes` (Edici?n inline de Criterios y R?bricas)
  - `Entregas de Ex?menes` (Visualizaci?n de fotos de ex?menes, estados y desglose inline de `GradedItem`)

Para crear un superusuario inicial:
```bash
python manage.py createsuperuser
```

---

## 3. Cat?logo de Rutas REST de la API

### A. Gesti?n de Cursos y Plantillas (`/api/exams/`)
- `GET /api/exams/courses/` - Lista todos los cursos con sus plantillas asociadas.
- `POST /api/exams/courses/` - Crea un nuevo curso.
- `GET /api/exams/courses/{id}/` - Obtiene detalle de un curso.
- `GET /api/exams/templates/` - Lista plantillas de ex?menes con r?bricas anidadas.
- `POST /api/exams/templates/` - Crea una nueva plantilla de examen.
- `GET /api/exams/templates/{id}/` - Detalle de plantilla con todas sus preguntas.
- `POST /api/exams/questions/` - Crea un criterio de pregunta asociado a una plantilla.

### B. Evaluaciones e IA (`/api/evaluations/`)
- `POST /api/evaluations/submissions/upload/` - **Endpoint principal de escaneo.**
  - **Content-Type:** `multipart/form-data`
  - **Campos:** `exam_template_id` (int), `exam_image` (archivo binario JPG/PNG)
  - **Flujo:** Guarda la imagen, invoca a Gemini 2.5 Flash, guarda ?tems calificados y emite evento por WebSocket `ws/exams/live/`.
- `GET /api/evaluations/submissions/` - Lista todas las entregas (filtros: `?exam_template_id={id}&status={status}`).
- `GET /api/evaluations/submissions/{id}/` - Detalle completo de una entrega con imagen y notas por pregunta.
- `POST /api/evaluations/submissions/{id}/update-grade/` - **Edici?n manual en caliente desde el Dashboard:**
  - **Body JSON:** `{"graded_item_id": 1, "score": 4.5, "ai_feedback": "Ajuste manual docente"}`
  - Recalcula la nota total, actualiza estado a `REVIEWED` y emite evento WebSocket.

---

## 4. Canal de WebSockets (Django Channels)

- **Endpoint ASGI:** `ws://localhost:8000/ws/exams/live/`
- **Eventos emitidos:**
  - `evaluation_started`: Notifica que la imagen ha sido subida y comienza el procesamiento multimodal con Gemini.
  - `evaluation_completed`: Notifica que la IA finaliz? la calificaci?n.
  - `score_updated`: Notifica que el docente ajust? una nota manualmente.
  - `evaluation_failed`: Notifica fallo en la evaluaci?n.
