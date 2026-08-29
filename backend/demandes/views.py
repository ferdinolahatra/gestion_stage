from django.utils import timezone

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User

from candidatures.models import CandidatureStage

from notifications.services import (
    log_and_notify_admins,
    notify_user,
)

from .models import Demande
from .serializers import DemandeSerializer


class DemandeViewSet(viewsets.ModelViewSet):

    queryset = Demande.objects.all().order_by(
        '-date_demande'
    )

    serializer_class = DemandeSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # =====================================================
    # FILTRAGE DES DEMANDES
    # =====================================================

    def get_queryset(self):

        user = self.request.user

        # =================================================
        # ADMIN
        # =================================================

        if user.role == 'ADMIN':

            return Demande.objects.all().order_by(
                '-date_demande'
            )

        # =================================================
        # ETUDIANT
        # =================================================

        if user.role == 'ETUDIANT':

            return Demande.objects.filter(
                etudiant=user
            ).order_by(
                '-date_demande'
            )

        # =================================================
        # ENTREPRISE
        # =================================================

        if user.role == 'ENTREPRISE':

            return Demande.objects.all().order_by(
                '-date_demande'
            )

        # =================================================
        # AUTRES
        # =================================================

        return Demande.objects.none()

    # =====================================================
    # CREATION D'UNE DEMANDE
    # =====================================================

    def perform_create(self, serializer):

        user = self.request.user

        # =================================================
        # SEUL UN ETUDIANT PEUT DEPOSER
        # =================================================

        if user.role != 'ETUDIANT':

            raise PermissionDenied(
                "Seuls les étudiants peuvent déposer une demande."
            )

        # =================================================
        # CREATION
        # =================================================

        demande = serializer.save(
            etudiant=user
        )

        # =================================================
        # NOTIFICATION DES ADMINISTRATEURS
        # =================================================

        log_and_notify_admins(

            actor=user,

            action='REQUEST_CREATED',

            description=(
                f"{user.username} a déposé "
                f"une nouvelle demande "
                f"« {demande.objet} »."
            ),

            title='Nouvelle demande',

            message=(
                f"{user.username} vient de déposer "
                f"une nouvelle demande."
            ),

            entity_type='demande',

            entity_id=demande.id,
        )

        # =================================================
        # NOTIFICATION DES ENTREPRISES
        # =================================================

        entreprises_users = User.objects.filter(
            role='ENTREPRISE',
            is_active=True
        )

        for entreprise_user in entreprises_users:

            notify_user(

                recipient=entreprise_user,

                actor=user,

                action='REQUEST_CREATED',

                title='Nouvelle demande',

                message=(
                    f"{user.username} vient de déposer "
                    f"une nouvelle demande : "
                    f"« {demande.objet} »."
                ),

                entity_type='demande',

                entity_id=demande.id,
            )

    # =====================================================
    # VALIDATION D'UNE DEMANDE
    # =====================================================

    @action(
        detail=True,
        methods=['patch'],
        url_path='validate'
    )
    def validate_demande(self, request, pk=None):

        user = request.user

        # =================================================
        # ADMIN UNIQUEMENT
        # =================================================

        if user.role != 'ADMIN':

            raise PermissionDenied(
                "Seuls les administrateurs peuvent valider une demande."
            )

        # =================================================
        # RECUPERATION DE LA DEMANDE
        # =================================================

        demande = self.get_object()

        # =================================================
        # VERIFICATION DU STATUT
        # =================================================

        if demande.statut != 'EN_ATTENTE':

            return Response(
                {
                    'detail': (
                        "Cette demande a déjà été traitée."
                    )
                },
                status=400
            )

        # =================================================
        # CREATION AUTOMATIQUE DE LA CANDIDATURE
        # =================================================

        candidature = None

        if demande.type_demande == 'STAGE':

            # =================================================
            # LE STAGE EST OBLIGATOIRE
            # =================================================

            if not demande.stage:

                return Response(
                    {
                        'detail': (
                            "Impossible de valider cette demande "
                            "car aucun stage n'est associé."
                        )
                    },
                    status=400
                )

            # =================================================
            # VERIFIER SI LA CANDIDATURE EXISTE DEJA
            # =================================================

            candidature = (
                CandidatureStage.objects.filter(
                    demande=demande
                ).first()
            )

            # =================================================
            # CREER LA CANDIDATURE
            # =================================================

            if not candidature:

                candidature = CandidatureStage.objects.create(

                    demande=demande,

                    etudiant=demande.etudiant,

                    offre_stage=demande.stage,

                    lettre_motivation=(
                        demande.lettre_motivation_texte
                        or ''
                    ),

                    lettre_motivation_fichier=(
                        demande.lettre_motivation_fichier
                    ),

                    cv=demande.cv,

                    statut='EN_ATTENTE'
                )

        # =================================================
        # VALIDATION DE LA DEMANDE
        # =================================================

        demande.statut = 'VALIDEE'

        demande.date_traitement = timezone.now()

        demande.save(
            update_fields=[
                'statut',
                'date_traitement',
            ]
        )

        # =================================================
        # NOTIFICATION ETUDIANT
        # =================================================

        notify_user(

            recipient=demande.etudiant,

            actor=user,

            action='REQUEST_VALIDATED',

            title='Demande validée',

            message=(
                f"Votre demande "
                f"« {demande.objet} » "
                f"a été validée par l'administrateur."
            ),

            entity_type='demande',

            entity_id=demande.id,
        )

        # =================================================
        # NOTIFICATION ENTREPRISES
        # =================================================

        entreprises_users = User.objects.filter(
            role='ENTREPRISE',
            is_active=True
        )

        for entreprise_user in entreprises_users:

            notify_user(

                recipient=entreprise_user,

                actor=user,

                action='REQUEST_VALIDATED',

                title='Demande validée',

                message=(
                    f"La demande "
                    f"« {demande.objet} » "
                    f"a été validée par l'administrateur."
                ),

                entity_type='demande',

                entity_id=demande.id,
            )

        # =================================================
        # REPONSE
        # =================================================

        serializer = self.get_serializer(
            demande
        )

        response_data = serializer.data

        # =================================================
        # INFORMER LE FRONTEND
        # =================================================

        if candidature:

            response_data['candidature_id'] = (
                candidature.id
            )

            response_data['candidature_creee'] = True

        else:

            response_data['candidature_creee'] = False

        return Response(
            response_data
        )

    # =====================================================
    # REFUS D'UNE DEMANDE
    # =====================================================

    @action(
        detail=True,
        methods=['patch'],
        url_path='refuse'
    )
    def refuse_demande(self, request, pk=None):

        user = request.user

        # =================================================
        # ADMIN UNIQUEMENT
        # =================================================

        if user.role != 'ADMIN':

            raise PermissionDenied(
                "Seuls les administrateurs peuvent refuser une demande."
            )

        # =================================================
        # RECUPERATION
        # =================================================

        demande = self.get_object()

        # =================================================
        # VERIFICATION DU STATUT
        # =================================================

        if demande.statut != 'EN_ATTENTE':

            return Response(
                {
                    'detail': (
                        "Cette demande a déjà été traitée."
                    )
                },
                status=400
            )

        # =================================================
        # REFUS
        # =================================================

        demande.statut = 'REFUSEE'

        demande.date_traitement = timezone.now()

        demande.save(
            update_fields=[
                'statut',
                'date_traitement',
            ]
        )

        # =================================================
        # NOTIFICATION ETUDIANT
        # =================================================

        notify_user(

            recipient=demande.etudiant,

            actor=user,

            action='REQUEST_REFUSED',

            title='Demande refusée',

            message=(
                f"Votre demande "
                f"« {demande.objet} » "
                f"a été refusée par l'administrateur."
            ),

            entity_type='demande',

            entity_id=demande.id,
        )

        # =================================================
        # NOTIFICATION ENTREPRISES
        # =================================================

        entreprises_users = User.objects.filter(
            role='ENTREPRISE',
            is_active=True
        )

        for entreprise_user in entreprises_users:

            notify_user(

                recipient=entreprise_user,

                actor=user,

                action='REQUEST_REFUSED',

                title='Demande refusée',

                message=(
                    f"La demande "
                    f"« {demande.objet} » "
                    f"a été refusée par l'administrateur."
                ),

                entity_type='demande',

                entity_id=demande.id,
            )

        # =================================================
        # REPONSE
        # =================================================

        serializer = self.get_serializer(
            demande
        )

        return Response(
            serializer.data
        )