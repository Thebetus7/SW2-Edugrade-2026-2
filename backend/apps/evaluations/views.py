from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import StudentSubmission, GradedItem
from .serializers import StudentSubmissionSerializer, GradedItemSerializer, ExamUploadSerializer
from apps.exams.models import ExamTemplate
from .services.ia import evaluate_exam_image
from .services.websocket_service import broadcast_evaluation_event

class StudentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = StudentSubmission.objects.all().prefetch_related('graded_items', 'exam_template__course')
    serializer_class = StudentSubmissionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        template_id = self.request.query_params.get('exam_template_id')
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student_identifier')
        student_name = self.request.query_params.get('student_name')
        search = self.request.query_params.get('search')

        if template_id:
            queryset = queryset.filter(exam_template_id=template_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if student_id:
            queryset = queryset.filter(student_identifier__icontains=student_id)
        if student_name:
            queryset = queryset.filter(student_name__icontains=student_name)
        if search:
            queryset = queryset.filter(
                student_name__icontains=search
            ) | queryset.filter(
                student_identifier__icontains=search
            ) | queryset.filter(
                exam_template__title__icontains=search
            )
        return queryset

    @extend_schema(
        request=ExamUploadSerializer,
        responses={201: StudentSubmissionSerializer},
        description='Recibe la imagen del examen escaneado desde Flutter/Web, procesa con Gemini 2.5 Flash y emite evento WebSocket en tiempo real.'
    )
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_and_evaluate(self, request):
        serializer = ExamUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        template_id = serializer.validated_data['exam_template_id']
        image_file = serializer.validated_data['exam_image']
        exam_template = get_object_or_404(ExamTemplate, id=template_id)

        submission = StudentSubmission.objects.create(
            exam_template=exam_template,
            exam_image=image_file,
            status=StudentSubmission.SubmissionStatus.PROCESSING
        )

        initial_serializer = StudentSubmissionSerializer(submission, context={'request': request})
        broadcast_evaluation_event('evaluation_started', initial_serializer.data)

        criteria_list = exam_template.questions.all().order_by('question_number')
        rubric_context = {
            'exam_title': exam_template.title,
            'course': exam_template.course.name,
            'total_max_score': float(exam_template.total_max_score),
            'questions': [
                {
                    'question_number': c.question_number,
                    'question_type': c.question_type,
                    'question_text': c.question_text,
                    'expected_answer_or_rubric': c.expected_answer_or_rubric,
                    'max_score': float(c.max_score)
                }
                for c in criteria_list
            ]
        }

        try:
            image_file.seek(0)
            image_bytes = image_file.read()
            ai_result = evaluate_exam_image(image_bytes=image_bytes, rubric_context=rubric_context)

            submission.student_name = ai_result.get('student_name', 'Estudiante No Identificado')
            submission.student_identifier = ai_result.get('student_identifier', '')
            submission.language_detected = ai_result.get('language_detected', 'es')
            submission.total_score = Decimal(str(ai_result.get('total_score', 0.0)))
            submission.raw_ai_response = ai_result
            submission.status = StudentSubmission.SubmissionStatus.GRADED
            submission.save()

            GradedItem.objects.filter(submission=submission).delete()
            for answer in ai_result.get('answers_evaluated', []):
                q_num = answer.get('question_number')
                matched_criteria = criteria_list.filter(question_number=q_num).first()
                
                GradedItem.objects.create(
                    submission=submission,
                    question_criteria=matched_criteria,
                    question_number=q_num,
                    question_type=answer.get('question_type', 'LONG_ANSWER'),
                    student_detected_response=answer.get('student_detected_response', ''),
                    expected_answer=answer.get('expected_answer', ''),
                    score=Decimal(str(answer.get('score', 0.0))),
                    max_score=Decimal(str(answer.get('max_score', 5.0))),
                    ai_feedback=answer.get('ai_feedback', '')
                )

            final_serializer = StudentSubmissionSerializer(submission, context={'request': request})
            broadcast_evaluation_event('evaluation_completed', final_serializer.data)
            return Response(final_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            submission.status = StudentSubmission.SubmissionStatus.FAILED
            submission.save()
            err_serializer = StudentSubmissionSerializer(submission, context={'request': request})
            broadcast_evaluation_event('evaluation_failed', err_serializer.data)
            return Response(
                {'error': f'Error evaluando examen con IA: {str(e)}', 'submission_id': submission.id},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='update-grade')
    def update_item_grade(self, request, pk=None):
        submission = self.get_object()
        item_id = request.data.get('graded_item_id')
        new_score = request.data.get('score')
        new_feedback = request.data.get('ai_feedback')

        graded_item = get_object_or_404(GradedItem, id=item_id, submission=submission)

        if new_score is not None:
            graded_item.score = Decimal(str(new_score))
            graded_item.is_manually_edited = True
        if new_feedback is not None:
            graded_item.ai_feedback = new_feedback

        graded_item.save()

        total = sum(item.score for item in submission.graded_items.all())
        submission.total_score = total
        submission.status = StudentSubmission.SubmissionStatus.REVIEWED
        submission.save()

        serialized = StudentSubmissionSerializer(submission, context={'request': request})
        broadcast_evaluation_event('score_updated', serialized.data)
        return Response(serialized.data, status=status.HTTP_200_OK)

class GradedItemViewSet(viewsets.ModelViewSet):
    queryset = GradedItem.objects.all().select_related('submission', 'question_criteria')
    serializer_class = GradedItemSerializer
    permission_classes = [permissions.AllowAny]
