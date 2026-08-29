from django.db import models

from accounts.models import User
from stages.models import OffreStage


class RapportStage(models.Model):

    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('VALIDE', 'Validé'),
        ('REFUSE', 'Refusé'),
    )

    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='rapports',
        limit_choices_to={'role': 'ETUDIANT'}
    )

    stage = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name='rapports'
    )

    titre = models.CharField(
        max_length=255
    )

    fichier = models.FileField(
        upload_to='rapports/'
    )

    commentaire = models.TextField(
        blank=True,
        null=True
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE'
    )

    date_depot = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.titre