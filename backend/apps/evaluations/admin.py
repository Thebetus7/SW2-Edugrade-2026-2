from django.contrib import admin
from .models import StudentSubmission, GradedItem

class GradedItemInline(admin.TabularInline):
    model = GradedItem
    extra = 0
    fields = ('question_number', 'question_type', 'score', 'max_score', 'is_manually_edited', 'ai_feedback')

@admin.register(StudentSubmission)
class StudentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student_name', 'exam_template', 'status', 'total_score', 'created_at')
    list_filter = ('status', 'exam_template', 'created_at')
    search_fields = ('student_name', 'student_identifier')
    inlines = [GradedItemInline]

@admin.register(GradedItem)
class GradedItemAdmin(admin.ModelAdmin):
    list_display = ('submission', 'question_number', 'score', 'max_score', 'is_manually_edited')
    list_filter = ('is_manually_edited', 'question_type')
