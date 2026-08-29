from rest_framework import serializers
from .models import RapportStage


class RapportStageSerializer(serializers.ModelSerializer):

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