from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Entreprise
from .serializers import EntrepriseSerializer

from accounts.permissions import IsAdminOrEntrepriseOrReadOnly
from notifications.services import log_and_notify_admins


class EntrepriseViewSet(viewsets.ModelViewSet):

    queryset = Entreprise.objects.all().order_by(
        '-date_creation'
    )

    serializer_class = EntrepriseSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrEntrepriseOrReadOnly
    ]

    def perform_create(self, serializer):

        entreprise = serializer.save()

        user = self.request.user

        log_and_notify_admins(
            actor=user,

            action='COMPANY_CREATED',

            description=(
                f"{user.username} a créé "
                f"l'entreprise « {entreprise} »."
            ),

            title='Nouvelle entreprise',

            message=(
                f"{user.username} vient d'ajouter "
                f"une nouvelle entreprise."
            ),

            entity_type='entreprise',

            entity_id=entreprise.id,
        )