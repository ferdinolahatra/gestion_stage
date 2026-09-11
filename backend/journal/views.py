from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import JournalStage
from .serializers import JournalStageSerializer

from notifications.services import log_and_notify_admins


class JournalStageViewSet(viewsets.ModelViewSet):
    queryset = JournalStage.objects.all().order_by('-date')
    serializer_class = JournalStageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # ADMIN : peut consulter tous les journaux
        if getattr(user, 'role', None) == 'ADMIN' or user.is_staff:
            return JournalStage.objects.all().order_by('-date')

        # ETUDIANT : uniquement ses propres journaux
        if getattr(user, 'role', None) == 'ETUDIANT':
            return JournalStage.objects.filter(etudiant=user).order_by('-date')

        # Par défaut, aucun accès
        return JournalStage.objects.none()

    def perform_create(self, serializer):
        # Sauvegarde du journal en associant l'utilisateur connecté
        journal = serializer.save(etudiant=self.request.user)

        user = self.request.user

        # Bloc try/except pour empêcher le crash 500 si la notification échoue
        try:
            log_and_notify_admins(
                actor=user,
                action='JOURNAL_CREATED',
                description=(
                    f"{user.username} a ajouté une entrée dans son "
                    f"journal de stage pour le {journal.date}."
                ),
                title='Nouveau journal de stage',
                message=(
                    f"{user.username} vient d'ajouter une nouvelle "
                    f"entrée dans son journal de stage."
                ),
                entity_type='journal',
                entity_id=journal.id,
            )
        except Exception as e:
            # Enregistre l'erreur en log sans faire planter la requête HTTP
            print(f"Erreur lors de l'envoi de la notification : {e}")