from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentSubmissionViewSet, GradedItemViewSet

router = DefaultRouter()
router.register(r'submissions', StudentSubmissionViewSet, basename='submission')
router.register(r'graded-items', GradedItemViewSet, basename='graded-item')

urlpatterns = [
    path('', include(router.urls)),
]
