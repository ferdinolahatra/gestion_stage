from rest_framework import serializers

from .models import Encadrement


class EncadrementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Encadrement

        fields = [
            'id',
            'enseignant',
            'etudiant',
            'stage',
            'date_affectation',
            'commentaire',
        ]

        read_only_fields = [
            'id',
            'date_affectation',
        ]