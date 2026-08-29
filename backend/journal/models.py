from django.db import models

from accounts.models import User
from stages.models import OffreStage


class JournalStage(models.Model):

    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='journaux',
        limit_choices_to={'role': 'ETUDIANT'}
    )

    stage = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name='journaux'
    )

    date = models.DateField()

    activite = models.TextField()

    difficultes = models.TextField(
        blank=True,
        null=True
    )

    solutions = models.TextField(
        blank=True,
        null=True
    )

    commentaire = models.TextField(
        blank=True,
        null=True
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.etudiant.username} - {self.date}"