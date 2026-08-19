from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, ExamTemplateViewSet, QuestionCriteriaViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'templates', ExamTemplateViewSet, basename='exam-template')
router.register(r'questions', QuestionCriteriaViewSet, basename='question-criteria')

urlpatterns = [
    path('', include(router.urls)),
]
