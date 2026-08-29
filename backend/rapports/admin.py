from django.contrib import admin
from .models import RapportStage


@admin.register(RapportStage)
class RapportStageAdmin(admin.ModelAdmin):

    list_display = (
        'titre',
        'etudiant',
        'stage',
        'statut',
        'date_depot',
    )

    list_filter = (
        'statut',
    )

    search_fields = (
        'titre',
        'etudiant__username',
    )