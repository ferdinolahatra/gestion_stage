from django.db import models

from accounts.models import User
from stages.models import OffreStage


class Encadrement(models.Model):

    enseignant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='encadrements',
        limit_choices_to={
            'role': 'ENSEIGNANT'
        }
    )


    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='suivis',
        limit_choices_to={
            'role': 'ETUDIANT'
        }
    )


    stage = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name='encadrements'
    )


    date_affectation = models.DateTimeField(
        auto_now_add=True
    )


    commentaire = models.TextField(
        blank=True,
        null=True
    )


    def __str__(self):

        return f"{self.etudiant.username} - {self.enseignant.username}"