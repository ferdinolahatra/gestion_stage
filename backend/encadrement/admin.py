from django.contrib import admin
from .models import Encadrement


@admin.register(Encadrement)
class EncadrementAdmin(admin.ModelAdmin):

    list_display = (
        'enseignant',
        'etudiant',
        'stage',
        'date_affectation',
    )

    search_fields = (
        'enseignant__username',
        'etudiant__username',
    )