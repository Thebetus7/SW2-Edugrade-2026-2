from django.db import models
from django.contrib.auth.models import User
from apps.core.models import TimeStampedModel

class Course(TimeStampedModel):
    name = models.CharField(max_length=200, verbose_name='Nombre del Curso')
    code = models.CharField(max_length=50, unique=True, verbose_name='Código del Curso')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses',
        verbose_name='Profesor a cargo'
    )

    class Meta:
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'
        ordering = ['name']

    def __str__(self):
        return f'{self.code} - {self.name}'


class ExamTemplate(TimeStampedModel):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='exam_templates',
        verbose_name='Curso'
    )
    title = models.CharField(max_length=255, verbose_name='Título del Examen')
    description = models.TextField(blank=True, null=True, verbose_name='Instrucciones o Descripción')
    total_max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.00,
        verbose_name='Puntaje Máximo Total'
    )
    is_active = models.BooleanField(default=True, verbose_name='¿Está Activo?')

    class Meta:
        verbose_name = 'Plantilla de Examen'
        verbose_name_plural = 'Plantillas de Exámenes'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.course.code})'


class QuestionCriteria(TimeStampedModel):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', 'Opción Múltiple'
        LONG_ANSWER = 'LONG_ANSWER', 'Respuesta de Texto Libre / Desarrollo'
        MATH_PROBABILITY = 'MATH_PROBABILITY', 'Matemáticas y Probabilidad'

    exam_template = models.ForeignKey(
        ExamTemplate,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Plantilla de Examen'
    )
    question_number = models.PositiveIntegerField(verbose_name='Número de Pregunta')
    question_type = models.CharField(
        max_length=30,
        choices=QuestionType.choices,
        default=QuestionType.LONG_ANSWER,
        verbose_name='Tipo de Pregunta'
    )
    question_text = models.TextField(verbose_name='Enunciado de la Pregunta')
    expected_answer_or_rubric = models.TextField(
        verbose_name='Rúbrica / Respuesta Esperada y Criterios de Evaluación'
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        verbose_name='Puntaje Máximo de la Pregunta'
    )

    class Meta:
        verbose_name = 'Criterio de Pregunta'
        verbose_name_plural = 'Criterios de Preguntas'
        ordering = ['question_number']
        unique_together = ('exam_template', 'question_number')

    def __str__(self):
        return f'P{self.question_number}: {self.question_text[:40]}... (Máx: {self.max_score} pts)'
