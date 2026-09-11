from rest_framework import serializers
from .models import RapportStage
from stages.models import Stage  # Assurez-vous d'importer votre modèle Stage


class RapportStageSerializer(serializers.ModelSerializer):

    etudiant = serializers.PrimaryKeyRelatedField(read_only=True)

    etudiant_nom = serializers.CharField(
        source="etudiant.username",
        read_only=True
    )

    stage_titre = serializers.CharField(
        source="stage.titre",
        read_only=True
    )

    evaluations = serializers.SerializerMethodField()

    class Meta:
        model = RapportStage
        fields = [
            "id",
            "etudiant",
            "etudiant_nom",
            "stage",
            "stage_titre",
            "titre",
            "fichier",
            "commentaire",
            "statut",
            "date_depot",
            "evaluations",
        ]
        read_only_fields = ["statut", "date_depot"]

    def to_internal_value(self, data):
        """
        Permet d'accepter soit le nom/titre du stage ("Reseau"), 
        soit son ID numérique tout en résolvant le champ etudiant automatiquement.
        """
        # Si le champ stage est transmis sous forme de texte (ex: "Reseau")
        stage_val = data.get("stage")
        if stage_val and not str(stage_val).isdigit():
            stage_obj = Stage.objects.filter(titre__iexact=stage_val).first()
            if stage_obj:
                # On remplace temporairement la donnée par l'ID réel pour que Django valide
                mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
                mutable_data["stage"] = stage_obj.id
                data = mutable_data
            else:
                raise serializers.ValidationError({
                    "stage": f"Aucun stage trouvé avec le titre '{stage_val}'."
                })

        return super().to_internal_value(data)

    def get_evaluations(self, obj):
        """
        Récupère les évaluations liées au même étudiant
        et au même stage que le rapport.
        """
        from evaluations.models import Evaluation

        evaluations = Evaluation.objects.filter(
            etudiant=obj.etudiant,
            stage=obj.stage
        ).select_related(
            "evaluateur"
        )

        return [
            {
                "id": evaluation.id,
                "type_evaluation": evaluation.type_evaluation,
                "note": float(evaluation.note),
                "commentaire": evaluation.commentaire,
                "date_evaluation": evaluation.date_evaluation,
                "evaluateur": (
                    evaluation.evaluateur.username
                    if evaluation.evaluateur
                    else None
                ),
            }
            for evaluation in evaluations
        ]