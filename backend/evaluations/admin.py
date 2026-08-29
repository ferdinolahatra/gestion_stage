from django.contrib import admin
from .models import Evaluation


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):

    list_display = (
        'etudiant',
        'stage',
        'type_evaluation',
        'note',
        'date_evaluation',
    )

    list_filter = (
        'type_evaluation',
    )

    search_fields = (
        'etudiant__username',
        'stage__titre',
    )