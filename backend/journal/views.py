from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import JournalStage
from .serializers import JournalStageSerializer

from notifications.services import log_and_notify_admins


class JournalStageViewSet(viewsets.ModelViewSet):

    queryset = JournalStage.objects.all().order_by(
        '-date'
    )

    serializer_class = JournalStageSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ADMIN :
        # peut consulter tous les journaux
        if user.role == 'ADMIN':
            return JournalStage.objects.all().order_by(
                '-date'
            )

        # ETUDIANT :
        # uniquement ses propres journaux
        if user.role == 'ETUDIANT':
            return JournalStage.objects.filter(
                etudiant=user
            ).order_by('-date')

        # Les autres rôles :
        # aucun accès
        return JournalStage.objects.none()

    def perform_create(self, serializer):

        journal = serializer.save(
            etudiant=self.request.user
        )

        user = self.request.user

        log_and_notify_admins(
            actor=user,

            action='JOURNAL_CREATED',

            description=(
                f"{user.username} a ajouté "
                f"une entrée dans son journal de stage "
                f"pour le {journal.date}."
            ),

            title='Nouveau journal de stage',

            message=(
                f"{user.username} vient d'ajouter "
                f"une nouvelle entrée dans son journal de stage."
            ),

            entity_type='journal',

            entity_id=journal.id,
        )