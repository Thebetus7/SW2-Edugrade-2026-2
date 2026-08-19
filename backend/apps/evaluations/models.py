from django.db import models
from apps.core.models import TimeStampedModel
from apps.exams.models import ExamTemplate, QuestionCriteria

class StudentSubmission(TimeStampedModel):
    class SubmissionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pendiente de Procesamiento'
        PROCESSING = 'PROCESSING', 'Evaluando con Gemini IA'
        GRADED = 'GRADED', 'Calificado por IA'
        REVIEWED = 'REVIEWED', 'Revisado y Aprobado por Docente'
        FAILED = 'FAILED', 'Error en Evaluación'

    exam_template = models.ForeignKey(
        ExamTemplate,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name="Plantilla de Examen"
    )
    student_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name="Nombre del Estudiante detectado"
    )
    student_identifier = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Código o ID del Estudiante"
    )
    exam_image = models.ImageField(
        upload_to='exam_scans/%Y/%m/%d/',
        verbose_name="Foto del Examen Escaneado"
    )
    status = models.CharField(
        max_length=20,
        choices=SubmissionStatus.choices,
        default=SubmissionStatus.PENDING,
        verbose_name="Estado de Evaluación"
    )
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Calificación Final"
    )
    language_detected = models.CharField(
        max_length=10,
        default='es',
        verbose_name="Idioma detectado (es/en)"
    )
    raw_ai_response = models.JSONField(
        blank=True,
        null=True,
        verbose_name="Respuesta JSON bruta de Gemini 2.5 Flash"
    )

    class Meta:
        verbose_name = "Entrega de Examen"
        verbose_name_plural = "Entregas de Exámenes"
        ordering = ['-created_at']

    def __str__(self):
        return f"Entrega #{self.id} - {self.student_name or 'Sin Nombre'} ({self.status})"


class GradedItem(TimeStampedModel):
    submission = models.ForeignKey(
        StudentSubmission,
        on_delete=models.CASCADE,
        related_name='graded_items',
        verbose_name="Entrega de Examen"
    )
    question_criteria = models.ForeignKey(
        QuestionCriteria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_instances',
        verbose_name="Criterio Asociado"
    )
    question_number = models.PositiveIntegerField(verbose_name="Número de Pregunta")
    question_type = models.CharField(
        max_length=30,
        verbose_name="Tipo de Pregunta"
    )
    student_detected_response = models.TextField(
        blank=True,
        null=True,
        verbose_name="Respuesta escrita por el alumno (OCR / IA)"
    )
    expected_answer = models.TextField(
        blank=True,
        null=True,
        verbose_name="Respuesta esperada según rúbrica"
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Puntaje Obtenido"
    )
    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        verbose_name="Puntaje Máximo Posible"
    )
    ai_feedback = models.TextField(
        blank=True,
        null=True,
        verbose_name="Retroalimentación y Justificación de la IA"
    )
    is_manually_edited = models.BooleanField(
        default=False,
        verbose_name="¿Modificado manualmente por el docente?"
    )

    class Meta:
        verbose_name = "Ítem Calificado"
        verbose_name_plural = "Ítems Calificados"
        ordering = ['question_number']

    def __str__(self):
        return f"Entrega #{self.submission_id} - P{self.question_number}: {self.score}/{self.max_score} pts"
