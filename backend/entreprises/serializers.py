from rest_framework import serializers

from .models import Entreprise


class EntrepriseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Entreprise
        fields = [
            'id',
            'nom',
            'secteur',
            'adresse',
            'email',
            'telephone',
            'site_web',
            'responsable',
            'date_creation',
        ]
        read_only_fields = [
            'id',
            'date_creation',
        ]