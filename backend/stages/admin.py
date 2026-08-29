from django.contrib import admin
from .models import OffreStage


@admin.register(OffreStage)
class OffreStageAdmin(admin.ModelAdmin):

    list_display = (
        'titre',
        'entreprise',
        'domaine',
        'statut',
        'nombre_places',
    )


    list_filter = (
        'statut',
        'domaine',
    )


    search_fields = (
        'titre',
        'entreprise__nom',
    )