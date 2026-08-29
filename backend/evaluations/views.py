from decimal import Decimal

from django.db import transaction

from rest_framework import (
    viewsets,
    status,
)

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from .models import Evaluation
from .serializers import EvaluationSerializer

from rapports.models import RapportStage
from stages.models import OffreStage


class EvaluationViewSet(viewsets.ModelViewSet):

    serializer_class = EvaluationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # =========================================================
    # QUERYSET
    # =========================================================

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Evaluation.objects
            .select_related(
                "etudiant",
                "stage",
                "evaluateur",
            )
            .order_by("-id")
        )

        # =====================================================
        # ADMIN
        # =====================================================

        if getattr(user, "role", None) == "ADMIN":

            return queryset

        # =====================================================
        # ETUDIANT
        #
        # L'étudiant voit uniquement ses évaluations.
        # =====================================================

        if getattr(user, "role", None) == "ETUDIANT":

            return queryset.filter(
                etudiant=user
            )

        # =====================================================
        # ENSEIGNANT
        #
        # Pour la page Évaluations, il peut consulter
        # les évaluations disponibles.
        # =====================================================

        if getattr(user, "role", None) == "ENSEIGNANT":

            return queryset

        # =====================================================
        # ENTREPRISE
        #
        # Pour la page Évaluations, elle peut consulter
        # les évaluations disponibles.
        # =====================================================

        if getattr(user, "role", None) == "ENTREPRISE":

            return queryset

        # =====================================================
        # AUTRE ROLE
        # =====================================================

        return queryset.none()

    # =========================================================
    # CREATION
    # =========================================================

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        user = request.user

        # =====================================================
        # AUTHENTIFICATION
        # =====================================================

        if not user.is_authenticated:

            return Response(
                {
                    "detail":
                        "Vous devez être connecté."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_role = getattr(
            user,
            "role",
            None
        )

        # =====================================================
        # ADMIN
        # =====================================================

        if user_role == "ADMIN":

            return Response(
                {
                    "detail":
                        (
                            "Un administrateur ne peut "
                            "pas créer une évaluation."
                        )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # ROLES AUTORISES
        # =====================================================

        if user_role not in [
            "ENTREPRISE",
            "ENSEIGNANT",
        ]:

            return Response(
                {
                    "detail":
                        (
                            "Votre rôle ne permet pas "
                            "de créer une évaluation."
                        )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # DONNEES
        # =====================================================

        stage_id = request.data.get(
            "stage"
        )

        type_evaluation = request.data.get(
            "type_evaluation"
        )

        note = request.data.get(
            "note"
        )

        commentaire = request.data.get(
            "commentaire"
        )

        # =====================================================
        # STAGE OBLIGATOIRE
        # =====================================================

        if not stage_id:

            return Response(
                {
                    "stage": [
                        "Le stage est obligatoire."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # TYPE EVALUATION
        # =====================================================

        if type_evaluation not in [
            "ENTREPRISE",
            "ENSEIGNANT",
        ]:

            return Response(
                {
                    "type_evaluation": [
                        "Type d'évaluation invalide."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # COHERENCE ROLE / TYPE
        # =====================================================

        if (
            user_role == "ENTREPRISE"
            and type_evaluation != "ENTREPRISE"
        ):

            return Response(
                {
                    "type_evaluation": [
                        (
                            "Une entreprise doit créer "
                            "une évaluation de type "
                            "ENTREPRISE."
                        )
                    ]
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if (
            user_role == "ENSEIGNANT"
            and type_evaluation != "ENSEIGNANT"
        ):

            return Response(
                {
                    "type_evaluation": [
                        (
                            "Un enseignant doit créer "
                            "une évaluation de type "
                            "ENSEIGNANT."
                        )
                    ]
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # NOTE
        # =====================================================

        try:

            note_value = Decimal(
                str(note)
            )

        except Exception:

            return Response(
                {
                    "note": [
                        "La note doit être un nombre."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            note_value < 0
            or note_value > 20
        ):

            return Response(
                {
                    "note": [
                        (
                            "La note doit être comprise "
                            "entre 0 et 20."
                        )
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # COMMENTAIRE
        # =====================================================

        if (
            not commentaire
            or not commentaire.strip()
        ):

            return Response(
                {
                    "commentaire": [
                        "Le commentaire est obligatoire."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        commentaire = commentaire.strip()

        # =====================================================
        # RECUPERER LE STAGE
        # =====================================================

        try:

            stage = OffreStage.objects.get(
                id=stage_id
            )

        except OffreStage.DoesNotExist:

            return Response(
                {
                    "stage": [
                        "Offre de stage introuvable."
                    ]
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =====================================================
        # RAPPORT VALIDE
        #
        # IMPORTANT :
        # On cherche le rapport validé correspondant
        # au stage.
        # =====================================================

        rapport = (
            RapportStage.objects
            .filter(
                stage=stage,
                statut="VALIDE",
            )
            .select_related(
                "etudiant",
                "stage",
            )
            .order_by(
                "-date_depot"
            )
            .first()
        )

        if not rapport:

            return Response(
                {
                    "rapport": [
                        (
                            "Aucun rapport validé "
                            "n'existe pour ce stage."
                        )
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # ETUDIANT DU RAPPORT
        # =====================================================

        etudiant = rapport.etudiant

        if not etudiant:

            return Response(
                {
                    "etudiant": [
                        (
                            "Impossible de déterminer "
                            "l'étudiant du rapport."
                        )
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # VERIFICATION ENTREPRISE
        # =====================================================

        if user_role == "ENTREPRISE":

            entreprise_user = getattr(
                user,
                "entreprise",
                None
            )

            if entreprise_user is not None:

                if (
                    stage.entreprise_id
                    != entreprise_user.id
                ):

                    return Response(
                        {
                            "detail":
                                (
                                    "Vous ne pouvez pas "
                                    "évaluer ce stage car "
                                    "il n'appartient pas "
                                    "à votre entreprise."
                                )
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

        # =====================================================
        # VERIFICATION DOUBLON
        #
        # IMPORTANT :
        # stage + étudiant + type
        # =====================================================

        existing_evaluation = (
            Evaluation.objects
            .filter(
                stage=stage,
                etudiant=etudiant,
                type_evaluation=type_evaluation,
            )
            .first()
        )

        if existing_evaluation:

            return Response(
                {
                    "detail":
                        (
                            "Une évaluation de ce type "
                            "existe déjà pour cet étudiant "
                            "et ce stage."
                        )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # CREATION
        # =====================================================

        evaluation = Evaluation.objects.create(

            stage=stage,

            etudiant=etudiant,

            evaluateur=user,

            type_evaluation=type_evaluation,

            note=note_value,

            commentaire=commentaire,
        )

        # =====================================================
        # SERIALIZER
        # =====================================================

        serializer = self.get_serializer(
            evaluation
        )

        # =====================================================
        # REPONSE
        # =====================================================

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # =========================================================
    # SUPPRESSION
    # =========================================================

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        user = request.user

        # =====================================================
        # ADMIN UNIQUEMENT
        # =====================================================

        if getattr(
            user,
            "role",
            None
        ) != "ADMIN":

            return Response(
                {
                    "detail":
                        (
                            "Seul un administrateur "
                            "peut supprimer une évaluation."
                        )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # EVALUATION
        # =====================================================

        evaluation = self.get_object()

        evaluation_id = evaluation.id

        # =====================================================
        # SUPPRESSION
        #
        # On supprime uniquement l'évaluation.
        # Le rapport de stage reste dans la base.
        # =====================================================

        evaluation.delete()

        # =====================================================
        # REPONSE
        # =====================================================

        return Response(
            {
                "message":
                    "Évaluation supprimée avec succès.",

                "evaluation_id":
                    evaluation_id,
            },
            status=status.HTTP_200_OK,
        )