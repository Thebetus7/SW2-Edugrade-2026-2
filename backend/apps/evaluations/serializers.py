from rest_framework import serializers
from .models import StudentSubmission, GradedItem

class GradedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradedItem
        fields = [
            'id',
            'question_number',
            'question_type',
            'student_detected_response',
            'expected_answer',
            'score',
            'max_score',
            'ai_feedback',
            'is_manually_edited',
            'created_at'
        ]

class StudentSubmissionSerializer(serializers.ModelSerializer):
    graded_items = GradedItemSerializer(many=True, read_only=True)
    exam_title = serializers.ReadOnlyField(source='exam_template.title')
    course_name = serializers.ReadOnlyField(source='exam_template.course.name')
    total_max_score = serializers.ReadOnlyField(source='exam_template.total_max_score')
    exam_image_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentSubmission
        fields = [
            'id',
            'exam_template',
            'exam_title',
            'course_name',
            'total_max_score',
            'student_name',
            'student_identifier',
            'exam_image',
            'exam_image_url',
            'status',
            'total_score',
            'language_detected',
            'raw_ai_response',
            'graded_items',
            'created_at',
            'updated_at'
        ]

    def get_exam_image_url(self, obj):
        request = self.context.get('request')
        if obj.exam_image and hasattr(obj.exam_image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.exam_image.url)
            return obj.exam_image.url
        return None

class ExamUploadSerializer(serializers.Serializer):
    exam_template_id = serializers.IntegerField(required=True)
    exam_image = serializers.ImageField(required=True)
