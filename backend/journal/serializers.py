from rest_framework import serializers

from .models import JournalStage


class JournalStageSerializer(serializers.ModelSerializer):

    class Meta:
        model = JournalStage

        fields = [
            'id',
            'etudiant',
            'stage',
            'date',
            'activite',
            'difficultes',
            'solutions',
            'commentaire',
            'date_creation',
        ]

        read_only_fields = [
            'id',
            'etudiant',
            'date_creation',
        ]

    def create(self, validated_data):

        request = self.context.get('request')

        journal = JournalStage.objects.create(
            etudiant=request.user,
            **validated_data
        )

        return journal