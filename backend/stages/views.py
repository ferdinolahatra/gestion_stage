from rest_framework import viewsets

from .models import OffreStage
from .serializers import OffreStageSerializer

from accounts.permissions import IsAdminOrEntrepriseOrReadOnly
from notifications.services import log_and_notify_admins


class OffreStageViewSet(viewsets.ModelViewSet):

    queryset = OffreStage.objects.all().order_by(
        '-date_creation'
    )

    serializer_class = OffreStageSerializer

    permission_classes = [
        IsAdminOrEntrepriseOrReadOnly
    ]

    def perform_create(self, serializer):

        offre = serializer.save()

        user = self.request.user

        log_and_notify_admins(
            actor=user,

            action='STAGE_CREATED',

            description=(
                f"{user.username} a créé "
                f"l'offre de stage "
                f"« {offre.titre} »."
            ),

            title='Nouvelle offre de stage',

            message=(
                f"{user.username} vient de créer "
                f"une nouvelle offre de stage."
            ),

            entity_type='offre_stage',

            entity_id=offre.id,
        )