from rest_framework import viewsets, permissions
from .models import Course, ExamTemplate, QuestionCriteria
from .serializers import CourseSerializer, ExamTemplateSerializer, QuestionCriteriaSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().prefetch_related('exam_templates')
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

class ExamTemplateViewSet(viewsets.ModelViewSet):
    queryset = ExamTemplate.objects.all().prefetch_related('questions', 'course')
    serializer_class = ExamTemplateSerializer
    permission_classes = [permissions.AllowAny]

class QuestionCriteriaViewSet(viewsets.ModelViewSet):
    queryset = QuestionCriteria.objects.all().select_related('exam_template')
    serializer_class = QuestionCriteriaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        exam_id = self.request.query_params.get('exam_template_id')
        if exam_id:
            queryset = queryset.filter(exam_template_id=exam_id)
        return queryset
