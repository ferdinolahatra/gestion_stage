from django.contrib import admin
from .models import JournalStage


@admin.register(JournalStage)
class JournalStageAdmin(admin.ModelAdmin):

    list_display = (
        'etudiant',
        'stage',
        'date',
        'date_creation',
    )

    list_filter = (
        'date',
    )

    search_fields = (
        'etudiant__username',
        'stage__titre',
    )