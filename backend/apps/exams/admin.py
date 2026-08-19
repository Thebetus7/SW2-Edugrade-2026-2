from django.contrib import admin
from .models import Course, ExamTemplate, QuestionCriteria

class QuestionCriteriaInline(admin.TabularInline):
    model = QuestionCriteria
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'teacher', 'created_at')
    search_fields = ('code', 'name')
    list_filter = ('created_at',)

@admin.register(ExamTemplate)
class ExamTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'total_max_score', 'is_active', 'created_at')
    search_fields = ('title', 'course__name', 'course__code')
    list_filter = ('is_active', 'course')
    inlines = [QuestionCriteriaInline]

@admin.register(QuestionCriteria)
class QuestionCriteriaAdmin(admin.ModelAdmin):
    list_display = ('exam_template', 'question_number', 'question_type', 'max_score')
    list_filter = ('question_type', 'exam_template')
    search_fields = ('question_text', 'expected_answer_or_rubric')
