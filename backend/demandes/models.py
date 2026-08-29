from django.db import models

from accounts.models import User
from entreprises.models import Entreprise
from stages.models import OffreStage


class Demande(models.Model):

    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('VALIDEE', 'Validée'),
        ('REFUSEE', 'Refusée'),
    )

    TYPE_CHOICES = (
        ('STAGE', 'Demande de stage'),
        ('CONVENTION', 'Convention de stage'),
        ('AUTRE', 'Autre demande'),
    )

    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='demandes',
        limit_choices_to={
            'role': 'ETUDIANT'
        }
    )

    entreprise = models.ForeignKey(
        Entreprise,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes'
    )

    stage = models.ForeignKey(
        OffreStage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes'
    )

    type_demande = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='STAGE'
    )

    objet = models.CharField(
        max_length=255
    )

    description = models.TextField()

    # =====================================================
    # CV
    # =====================================================

    cv = models.FileField(
        upload_to='demandes/cv/',
        blank=True,
        null=True
    )

    # =====================================================
    # LETTRE DE MOTIVATION — FICHIER
    # =====================================================

    lettre_motivation_fichier = models.FileField(
        upload_to='demandes/lettres/',
        blank=True,
        null=True
    )

    # =====================================================
    # LETTRE DE MOTIVATION — TEXTE
    # =====================================================

    lettre_motivation_texte = models.TextField(
        blank=True,
        null=True
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE'
    )

    commentaire_admin = models.TextField(
        blank=True,
        null=True
    )

    date_demande = models.DateTimeField(
        auto_now_add=True
    )

    date_traitement = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.etudiant.username} - "
            f"{self.objet}"
        )