from rest_framework import serializers

from .models import Evaluation


class EvaluationSerializer(
    serializers.ModelSerializer
):

    # ---------------------------------------------------------
    # INFORMATIONS ÉTUDIANT
    # ---------------------------------------------------------

    etudiant_username = serializers.SerializerMethodField()

    # ---------------------------------------------------------
    # INFORMATIONS ÉVALUATEUR
    # ---------------------------------------------------------

    evaluateur_username = serializers.SerializerMethodField()

    # ---------------------------------------------------------
    # INFORMATIONS STAGE
    # ---------------------------------------------------------

    stage_titre = serializers.SerializerMethodField()

    class Meta:

        model = Evaluation

        fields = [
            "id",

            "etudiant",
            "etudiant_username",

            "stage",
            "stage_titre",

            "evaluateur",
            "evaluateur_username",

            "type_evaluation",

            "note",
            "commentaire",

            "date_evaluation",
        ]

        read_only_fields = [
            "id",

            "etudiant",
            "etudiant_username",

            "evaluateur",
            "evaluateur_username",

            "stage_titre",

            "date_evaluation",
        ]

    # =========================================================
    # ÉTUDIANT
    # =========================================================

    def get_etudiant_username(
        self,
        obj
    ):

        if obj.etudiant:
            return obj.etudiant.username

        return None

    # =========================================================
    # ÉVALUATEUR
    # =========================================================

    def get_evaluateur_username(
        self,
        obj
    ):

        if obj.evaluateur:
            return obj.evaluateur.username

        return None

    # =========================================================
    # STAGE
    # =========================================================

    def get_stage_titre(
        self,
        obj
    ):

        if obj.stage:
            return obj.stage.titre

        return None

    # =========================================================
    # NOTE
    # =========================================================

    def validate_note(
        self,
        value
    ):

        if value < 0 or value > 20:

            raise serializers.ValidationError(
                "La note doit être comprise entre 0 et 20."
            )

        return value

    # =========================================================
    # COMMENTAIRE
    # =========================================================

    def validate_commentaire(
        self,
        value
    ):

        if not value or not value.strip():

            raise serializers.ValidationError(
                "Le commentaire est obligatoire."
            )

        return value.strip()