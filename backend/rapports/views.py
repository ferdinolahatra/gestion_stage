from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import RapportStage
from .serializers import RapportStageSerializer

from notifications.services import (
    log_and_notify_admins,
    notify_user,
)


class RapportStageViewSet(viewsets.ModelViewSet):

    serializer_class = RapportStageSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # =========================================================
    # LISTE DES RAPPORTS
    # =========================================================

    def get_queryset(self):

        user = self.request.user

        # =====================================================
        # ADMIN
        # =====================================================

        if user.role == "ADMIN":

            return (
                RapportStage.objects
                .select_related(
                    "etudiant",
                    "stage",
                )
                .all()
                .order_by("-date_depot")
            )

        # =====================================================
        # ETUDIANT
        # =====================================================

        if user.role == "ETUDIANT":

            return (
                RapportStage.objects
                .select_related(
                    "etudiant",
                    "stage",
                )
                .filter(
                    etudiant=user
                )
                .order_by("-date_depot")
            )

        # =====================================================
        # ENTREPRISE
        #
        # Pour la page Évaluations, on récupère les rapports
        # validés.
        # =====================================================

        if user.role == "ENTREPRISE":

            return (
                RapportStage.objects
                .select_related(
                    "etudiant",
                    "stage",
                )
                .filter(
                    statut="VALIDE"
                )
                .order_by("-date_depot")
            )

        # =====================================================
        # ENSEIGNANT
        #
        # Pour la page Évaluations, on récupère les rapports
        # validés.
        # =====================================================

        if user.role == "ENSEIGNANT":

            return (
                RapportStage.objects
                .select_related(
                    "etudiant",
                    "stage",
                )
                .filter(
                    statut="VALIDE"
                )
                .order_by("-date_depot")
            )

        # =====================================================
        # AUTRES ROLES
        # =====================================================

        return RapportStage.objects.none()

    # =========================================================
    # DEPOT D'UN RAPPORT
    # =========================================================

    def perform_create(self, serializer):

        user = self.request.user

        # -----------------------------------------------------
        # SEUL UN ETUDIANT PEUT DEPOSER
        # -----------------------------------------------------

        if user.role != "ETUDIANT":

            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Seul un étudiant peut déposer "
                "un rapport de stage."
            )

        # -----------------------------------------------------
        # CREATION
        # -----------------------------------------------------

        rapport = serializer.save(
            etudiant=user
        )

        # -----------------------------------------------------
        # NOTIFICATION ADMIN
        # -----------------------------------------------------

        log_and_notify_admins(

            actor=user,

            action="REPORT_CREATED",

            description=(
                f"{user.username} a déposé "
                f"le rapport « {rapport.titre} »."
            ),

            title="Nouveau rapport de stage",

            message=(
                f"{user.username} vient de déposer "
                f"un nouveau rapport de stage."
            ),

            entity_type="rapport",

            entity_id=rapport.id,
        )

    # =========================================================
    # VALIDATION D'UN RAPPORT
    # =========================================================

    @action(
        detail=True,
        methods=["patch"],
        url_path="validate"
    )
    def validate_report(
        self,
        request,
        pk=None
    ):

        rapport = self.get_object()

        # -----------------------------------------------------
        # ADMIN UNIQUEMENT
        # -----------------------------------------------------

        if request.user.role != "ADMIN":

            return Response(
                {
                    "detail": (
                        "Seul un administrateur peut "
                        "valider un rapport."
                    )
                },
                status=403
            )

        # -----------------------------------------------------
        # DEJA VALIDE
        # -----------------------------------------------------

        if rapport.statut == "VALIDE":

            return Response(
                {
                    "detail": (
                        "Ce rapport est déjà validé."
                    )
                },
                status=400
            )

        # -----------------------------------------------------
        # VALIDATION
        # -----------------------------------------------------

        rapport.statut = "VALIDE"

        rapport.save(
            update_fields=[
                "statut"
            ]
        )

        # -----------------------------------------------------
        # NOTIFICATION ETUDIANT
        # -----------------------------------------------------

        notify_user(

            recipient=rapport.etudiant,

            actor=request.user,

            action="REPORT_VALIDATED",

            title="Rapport validé",

            message=(
                f"Votre rapport « "
                f"{rapport.titre} » "
                f"a été validé par "
                f"l'administrateur."
            ),

            entity_type="rapport",

            entity_id=rapport.id,
        )

        # -----------------------------------------------------
        # REPONSE
        # -----------------------------------------------------

        return Response(
            {
                "message":
                    "Rapport validé avec succès.",

                "statut":
                    rapport.statut,

                "rapport_id":
                    rapport.id,
            }
        )

    # =========================================================
    # REFUS D'UN RAPPORT
    # =========================================================

    @action(
        detail=True,
        methods=["patch"],
        url_path="refuse"
    )
    def refuse_report(
        self,
        request,
        pk=None
    ):

        rapport = self.get_object()

        # -----------------------------------------------------
        # ADMIN UNIQUEMENT
        # -----------------------------------------------------

        if request.user.role != "ADMIN":

            return Response(
                {
                    "detail": (
                        "Seul un administrateur peut "
                        "refuser un rapport."
                    )
                },
                status=403
            )

        # -----------------------------------------------------
        # DEJA REFUSE
        # -----------------------------------------------------

        if rapport.statut == "REFUSE":

            return Response(
                {
                    "detail": (
                        "Ce rapport est déjà refusé."
                    )
                },
                status=400
            )

        # -----------------------------------------------------
        # REFUS
        # -----------------------------------------------------

        rapport.statut = "REFUSE"

        rapport.save(
            update_fields=[
                "statut"
            ]
        )

        # -----------------------------------------------------
        # NOTIFICATION ETUDIANT
        # -----------------------------------------------------

        notify_user(

            recipient=rapport.etudiant,

            actor=request.user,

            action="REPORT_REFUSED",

            title="Rapport refusé",

            message=(
                f"Votre rapport « "
                f"{rapport.titre} » "
                f"a été refusé par "
                f"l'administrateur."
            ),

            entity_type="rapport",

            entity_id=rapport.id,
        )

        # -----------------------------------------------------
        # REPONSE
        # -----------------------------------------------------

        return Response(
            {
                "message":
                    "Rapport refusé.",

                "statut":
                    rapport.statut,

                "rapport_id":
                    rapport.id,
            }
        )