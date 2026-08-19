# Guía Rápida de Uso: Django ORM

Esta guía proporciona ejemplos prácticos de cómo interactuar con la base de datos utilizando el **Django ORM (Object-Relational Mapper)**, desde consultas básicas (CRUD) hasta optimizaciones avanzadas de rendimiento.

---

## 1. Operaciones Básicas (CRUD)

Tomando como referencia el modelo `StudentSubmission` (Entrega de Examen) y `GradedItem` (Item Calificado):

### 🟢 Crear Registros (Create)

Existen dos formas principales de guardar un nuevo registro:

1. **Usando `.save()` (Instanciación clásica):**
   ```python
   from apps.evaluations.models import StudentSubmission

   submission = StudentSubmission(
       student_name="Juan Pérez",
       student_identifier="EST-99482",
       exam_title="Examen de Álgebra",
       status="PENDING"
   )
   submission.save()  # Guarda en la base de datos
   ```

2. **Usando `.objects.create()` (Acción en una línea):**
   ```python
   submission = StudentSubmission.objects.create(
       student_name="María López",
       student_identifier="EST-12844",
       exam_title="Examen de Física",
       status="GRADED",
       total_score=18.5
   )
   ```

---

### 🔵 Consultar y Filtrar Registros (Read)

Las consultas devuelven un `QuerySet` (una lista de objetos evaluada de forma perezosa).

1. **Obtener TODOS los registros:**
   ```python
   entregas = StudentSubmission.objects.all()
   ```

2. **Obtener un ÚNICO registro (por clave primaria u otro campo único):**
   * *Nota: Lanza `DoesNotExist` si no lo encuentra, o `MultipleObjectsReturned` si encuentra más de uno.*
   ```python
   entrega = StudentSubmission.objects.get(id=1)
   ```

3. **Filtrar registros (`filter`):**
   ```python
   # Entregas que ya fueron calificadas
   entregas_evaluadas = StudentSubmission.objects.filter(status="GRADED")
   ```

4. **Excluir registros (`exclude`):**
   ```python
   # Entregas que NO estén fallidas
   entregas_validas = StudentSubmission.objects.exclude(status="FAILED")
   ```

---

### 🟡 Actualizar Registros (Update)

1. **Actualizar una instancia individual:**
   ```python
   entrega = StudentSubmission.objects.get(id=1)
   entrega.status = "REVIEWED"
   entrega.total_score = 19.0
   entrega.save()  # Guarda los cambios
   ```

2. **Actualizar múltiples registros de golpe (`update`):**
   * *Nota: Esto ejecuta una sola consulta SQL `UPDATE` directa muy eficiente.*
   ```python
   StudentSubmission.objects.filter(status="PENDING").update(status="PROCESSING")
   ```

---

### 🔴 Eliminar Registros (Delete)

1. **Eliminar una instancia individual:**
   ```python
   entrega = StudentSubmission.objects.get(id=5)
   entrega.delete()
   ```

2. **Eliminar múltiples registros filtrados:**
   ```python
   StudentSubmission.objects.filter(status="FAILED").delete()
   ```

---

## 2. Filtros Avanzados (Field Lookups)

Django utiliza la sintaxis de doble guion bajo (`__`) para realizar filtros SQL avanzados (como `LIKE`, `IN`, `BETWEEN`, `>` o `<`):

```python
# Búsqueda insensible a mayúsculas (ILIKE) -> Contiene "álgebra"
StudentSubmission.objects.filter(exam_title__icontains="álgebra")

# Búsqueda exacta insensible a mayúsculas
StudentSubmission.objects.filter(student_name__iexact="juan pérez")

# Mayor que (Greater Than - gt) y Mayor o igual (gte)
StudentSubmission.objects.filter(total_score__gt=15.0)

# Menor que (Less Than - lt) y Menor o igual (lte)
StudentSubmission.objects.filter(total_score__lte=10.5)

# Pertenencia en una lista (IN)
StudentSubmission.objects.filter(status__in=["GRADED", "REVIEWED"])

# Filtrar por fecha / año / mes
StudentSubmission.objects.filter(created_at__year=2026)
```

---

## 3. Relaciones y Llaves Foráneas (Foreign Keys)

### Obtener el objeto relacionado (Hacia adelante)
```python
# GradedItem tiene un ForeignKey apuntando a StudentSubmission
item = GradedItem.objects.get(id=10)
submission_padre = item.submission  # Devuelve el objeto StudentSubmission relacionado
print(submission_padre.student_name)
```

### Obtener los hijos relacionados (Hacia atrás usando `related_name`)
```python
# StudentSubmission tiene muchos GradedItem relacionados mediante related_name='graded_items'
submission = StudentSubmission.objects.get(id=1)
items_calificados = submission.graded_items.all()  # Devuelve un QuerySet con sus GradedItem
```

---

## 4. Optimización de Consultas (Evitar el problema N+1)

El problema de consultas N+1 ocurre cuando recorres un QuerySet y por cada registro haces una consulta adicional a la base de datos para obtener un objeto relacionado.

### 1. `select_related` (Para Foreign Key / OneToOne)
Ejecuta un `SQL JOIN` para traer los datos del objeto relacionado en una sola consulta.
```python
# INCORRECTO (Genera N+1 consultas al acceder a item.submission)
items = GradedItem.objects.all()
for item in items:
    print(item.submission.student_name)

# CORRECTO (Genera 1 sola consulta SQL con INNER JOIN)
items = GradedItem.objects.select_related('submission').all()
for item in items:
    print(item.submission.student_name)
```

### 2. `prefetch_related` (Para ManyToMany / Relaciones Inversas)
Realiza una consulta adicional separada para traer todos los objetos relacionados y los mapea en memoria de forma inteligente.
```python
# CORRECTO para traer entregas y pre-cargar su lista de items calificados asociados
entregas = StudentSubmission.objects.prefetch_related('graded_items').all()
for e in entregas:
    # No genera consultas adicionales al llamar a .all() aquí:
    for item in e.graded_items.all():
        print(item.question_number, item.score)
```

---

## 5. Consultas con Operadores Lógicos (Q objects)

Para hacer consultas complejas con operadores `OR` o negaciones `NOT`, importa `Q`:

```python
from django.db.models import Q

# Buscar entregas que se llamen "Juan" O que tengan nota mayor a 18
entregas = StudentSubmission.objects.filter(
    Q(student_name__icontains="Juan") | Q(total_score__gt=18.0)
)

# Buscar entregas de "Juan" y que su estado NO sea "FAILED"
entregas = StudentSubmission.objects.filter(
    Q(student_name__icontains="Juan") & ~Q(status="FAILED")
)
```
