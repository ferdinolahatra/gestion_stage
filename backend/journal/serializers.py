from rest_framework import serializers
from django.apps import apps
from .models import JournalStage


class JournalStageSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(
        source="etudiant.username", 
        read_only=True
    )
    stage_titre = serializers.CharField(
        source="stage.titre", 
        read_only=True
    )

    class Meta:
        model = JournalStage
        fields = [
            'id',
            'etudiant',
            'etudiant_nom',
            'stage',
            'stage_titre',
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

    def to_internal_value(self, data):
        """
        Convertit le titre du stage ("Reseau") en ID numérique avant validation.
        """
        stage_val = data.get("stage")
        if stage_val and not str(stage_val).isdigit():
            try:
                StageModel = apps.get_model("stages", "Stage")
                stage_obj = StageModel.objects.filter(titre__iexact=str(stage_val)).first()
                if stage_obj:
                    mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
                    mutable_data["stage"] = stage_obj.id
                    data = mutable_data
                else:
                    raise serializers.ValidationError({
                        "stage": f"Aucun stage trouvé avec le titre '{stage_val}'."
                    })
            except Exception as e:
                raise serializers.ValidationError({
                    "stage": f"Erreur de résolution du stage '{stage_val}': {str(e)}"
                })

        return super().to_internal_value(data)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and not validated_data.get('etudiant'):
            validated_data['etudiant'] = request.user

        return super().create(validated_data)