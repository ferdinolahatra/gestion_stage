from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CandidatureStage
from .serializers import CandidatureStageSerializer

from notifications.services import (
    log_and_notify_admins,
    notify_user,
    create_activity,
)


class CandidatureStageViewSet(viewsets.ModelViewSet):

    serializer_class = CandidatureStageSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = CandidatureStage.objects.select_related(
            'etudiant',
            'offre_stage',
            'demande',
            'demande__entreprise'
        ).order_by(
            '-date_candidature'
        )

        # =================================================
        # ADMIN
        # =================================================

        if user.role == 'ADMIN':

            return queryset

        # =================================================
        # ETUDIANT
        # =================================================

        if user.role == 'ETUDIANT':

            return queryset.filter(
                etudiant=user
            )

        # =================================================
        # AUTRES
        # =================================================

        return CandidatureStage.objects.none()

    # =====================================================
    # CREATION
    # =====================================================

    def perform_create(self, serializer):

        candidature = serializer.save(
            etudiant=self.request.user
        )

        user = self.request.user

        log_and_notify_admins(

            actor=user,

            action='APPLICATION_CREATED',

            description=(
                f"{user.username} a envoyé "
                f"une candidature pour l'offre "
                f"« {candidature.offre_stage.titre} »."
            ),

            title='Nouvelle candidature',

            message=(
                f"{user.username} vient de déposer "
                f"une nouvelle candidature."
            ),

            entity_type='candidature',

            entity_id=candidature.id,
        )

    # =====================================================
    # ACCEPTER
    # =====================================================

    @action(
        detail=True,
        methods=['patch'],
        url_path='accept'
    )
    def accept(self, request, pk=None):

        candidature = self.get_object()

        if request.user.role != 'ADMIN':

            return Response(
                {
                    'detail':
                    'Seul un administrateur peut accepter une candidature.'
                },
                status=403
            )

        if candidature.statut == 'ACCEPTEE':

            return Response(
                {
                    'detail':
                    'Cette candidature est déjà acceptée.'
                },
                status=400
            )

        candidature.statut = 'ACCEPTEE'

        candidature.save(
            update_fields=['statut']
        )

        create_activity(

            actor=request.user,

            action='APPLICATION_ACCEPTED',

            description=(
                f"L'administrateur "
                f"{request.user.username} a accepté "
                f"la candidature de "
                f"{candidature.etudiant.username} "
                f"pour l'offre "
                f"« {candidature.offre_stage.titre} »."
            ),

            entity_type='candidature',

            entity_id=candidature.id,
        )

        notify_user(

            recipient=candidature.etudiant,

            actor=request.user,

            action='APPLICATION_ACCEPTED',

            title='Candidature acceptée',

            message=(
                f"Votre candidature pour "
                f"« {candidature.offre_stage.titre} » "
                f"a été acceptée."
            ),

            entity_type='candidature',

            entity_id=candidature.id,
        )

        return Response(
            {
                'message':
                'Candidature acceptée.',

                'statut':
                candidature.statut,
            }
        )

    # =====================================================
    # REFUSER
    # =====================================================

    @action(
        detail=True,
        methods=['patch'],
        url_path='refuse'
    )
    def refuse(self, request, pk=None):

        candidature = self.get_object()

        if request.user.role != 'ADMIN':

            return Response(
                {
                    'detail':
                    'Seul un administrateur peut refuser une candidature.'
                },
                status=403
            )

        if candidature.statut == 'REFUSEE':

            return Response(
                {
                    'detail':
                    'Cette candidature est déjà refusée.'
                },
                status=400
            )

        candidature.statut = 'REFUSEE'

        candidature.save(
            update_fields=['statut']
        )

        create_activity(

            actor=request.user,

            action='APPLICATION_REFUSED',

            description=(
                f"L'administrateur "
                f"{request.user.username} a refusé "
                f"la candidature de "
                f"{candidature.etudiant.username} "
                f"pour l'offre "
                f"« {candidature.offre_stage.titre} »."
            ),

            entity_type='candidature',

            entity_id=candidature.id,
        )

        notify_user(

            recipient=candidature.etudiant,

            actor=request.user,

            action='APPLICATION_REFUSED',

            title='Candidature refusée',

            message=(
                f"Votre candidature pour "
                f"« {candidature.offre_stage.titre} » "
                f"n'a pas été retenue."
            ),

            entity_type='candidature',

            entity_id=candidature.id,
        )

        return Response(
            {
                'message':
                'Candidature refusée.',

                'statut':
                candidature.statut,
            }
        )