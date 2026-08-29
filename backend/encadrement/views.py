from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Encadrement
from .serializers import EncadrementSerializer

from accounts.permissions import IsAdminOrEnseignant
from notifications.services import log_and_notify_admins


class EncadrementViewSet(viewsets.ModelViewSet):

    queryset = Encadrement.objects.all().order_by(
        '-date_affectation'
    )

    serializer_class = EncadrementSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrEnseignant
    ]

    def get_queryset(self):

        user = self.request.user

        # ADMIN :
        # peut voir tous les encadrements
        if user.role == 'ADMIN':
            return Encadrement.objects.all().order_by(
                '-date_affectation'
            )

        # ENSEIGNANT :
        # uniquement ses propres encadrements
        if user.role == 'ENSEIGNANT':
            return Encadrement.objects.filter(
                enseignant=user
            ).order_by('-date_affectation')

        # Autres rôles :
        # aucun accès
        return Encadrement.objects.none()

    def perform_create(self, serializer):

        encadrement = serializer.save()

        user = self.request.user

        log_and_notify_admins(
            actor=user,

            action='SUPERVISION_CREATED',

            description=(
                f"{user.username} a créé un encadrement "
                f"pour l'étudiant "
                f"« {encadrement.etudiant.username} »."
            ),

            title='Nouvel encadrement',

            message=(
                f"{user.username} vient de créer "
                f"un nouvel encadrement."
            ),

            entity_type='encadrement',

            entity_id=encadrement.id,
        )