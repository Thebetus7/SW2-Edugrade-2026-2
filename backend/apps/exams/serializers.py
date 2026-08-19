from rest_framework import serializers
from .models import Course, ExamTemplate, QuestionCriteria

class QuestionCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionCriteria
        fields = [
            'id',
            'question_number',
            'question_type',
            'question_text',
            'expected_answer_or_rubric',
            'max_score',
            'created_at'
        ]

class ExamTemplateSerializer(serializers.ModelSerializer):
    questions = QuestionCriteriaSerializer(many=True, read_only=True)
    course_name = serializers.ReadOnlyField(source='course.name')
    course_code = serializers.ReadOnlyField(source='course.code')

    class Meta:
        model = ExamTemplate
        fields = [
            'id',
            'course',
            'course_name',
            'course_code',
            'title',
            'description',
            'total_max_score',
            'is_active',
            'questions',
            'created_at',
            'updated_at'
        ]

class CourseSerializer(serializers.ModelSerializer):
    exam_templates = ExamTemplateSerializer(many=True, read_only=True)
    teacher_username = serializers.ReadOnlyField(source='teacher.username')

    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'code',
            'description',
            'teacher',
            'teacher_username',
            'exam_templates',
            'created_at',
            'updated_at'
        ]
