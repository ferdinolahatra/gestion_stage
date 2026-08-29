from django.db import models

from accounts.models import User
from stages.models import OffreStage
from demandes.models import Demande


class CandidatureStage(models.Model):

    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('ACCEPTEE', 'Acceptée'),
        ('REFUSEE', 'Refusée'),
    )

    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={
            'role': 'ETUDIANT'
        },
        related_name='candidatures'
    )

    offre_stage = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name='candidatures'
    )

    # =====================================================
    # DEMANDE D'ORIGINE
    # =====================================================

    demande = models.OneToOneField(
        Demande,
        on_delete=models.CASCADE,
        related_name='candidature',
        null=True,
        blank=True
    )

    # =====================================================
    # LETTRE DE MOTIVATION — TEXTE
    # =====================================================

    lettre_motivation = models.TextField(
        blank=True,
        null=True
    )

    # =====================================================
    # LETTRE DE MOTIVATION — FICHIER
    # =====================================================

    lettre_motivation_fichier = models.FileField(
        upload_to='candidatures/lettres/',
        blank=True,
        null=True
    )

    # =====================================================
    # CV
    # =====================================================

    cv = models.FileField(
        upload_to='candidatures/cv/',
        blank=True,
        null=True
    )

    # =====================================================
    # STATUT
    # =====================================================

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE'
    )

    # =====================================================
    # DATE
    # =====================================================

    date_candidature = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.etudiant.username} - "
            f"{self.offre_stage.titre}"
        )