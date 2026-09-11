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
        try:
            mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)

            # 1. Correspondance des noms de champs Frontend -> Backend
            if 'activites' in mutable_data and 'activite' not in mutable_data:
                mutable_data['activite'] = mutable_data.pop('activites')
            if 'activite_realisee' in mutable_data and 'activite' not in mutable_data:
                mutable_data['activite'] = mutable_data.pop('activite_realisee')

            # 2. Convertir la chaîne du stage en ID de base de données
            stage_val = mutable_data.get("stage")
            if stage_val and not str(stage_val).isdigit():
                StageModel = apps.get_model("stages", "Stage")
                stage_obj = StageModel.objects.filter(titre__iexact=str(stage_val)).first()
                if stage_obj:
                    mutable_data["stage"] = stage_obj.id

            return super().to_internal_value(mutable_data)
        except Exception as e:
            # Renvoie une erreur de validation 400 détaillée au lieu de faire un crash 500
            raise serializers.ValidationError({"detail_erreur_serveur": str(e)})

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and not validated_data.get('etudiant'):
            validated_data['etudiant'] = request.user

        return super().create(validated_data)    