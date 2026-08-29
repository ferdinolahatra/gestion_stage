from django.contrib import admin
from .models import CandidatureStage


@admin.register(CandidatureStage)
class CandidatureStageAdmin(admin.ModelAdmin):

    list_display = (
        'etudiant',
        'offre_stage',
        'statut',
        'date_candidature',
    )


    list_filter = (
        'statut',
    )


    search_fields = (
        'etudiant__username',
        'offre_stage__titre',
    )
