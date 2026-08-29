from rest_framework import serializers

from .models import OffreStage


class OffreStageSerializer(serializers.ModelSerializer):

    class Meta:
        model = OffreStage

        fields = [
            'id',
            'titre',
            'description',
            'domaine',
            'competences_requises',
            'entreprise',
            'duree',
            'date_debut',
            'date_fin',
            'nombre_places',
            'statut',
            'date_creation',
        ]

        read_only_fields = [
            'id',
            'date_creation',
        ]