from django.db import models
from entreprises.models import Entreprise


class OffreStage(models.Model):

    STATUT_CHOICES = (

        ('OUVERT', 'Ouvert'),

        ('FERME', 'Fermé'),

    )


    titre = models.CharField(
        max_length=200
    )


    description = models.TextField()


    domaine = models.CharField(
        max_length=100
    )


    competences_requises = models.TextField()


    entreprise = models.ForeignKey(
        Entreprise,
        on_delete=models.CASCADE,
        related_name='offres_stage'
    )


    duree = models.CharField(
        max_length=100
    )


    date_debut = models.DateField()


    date_fin = models.DateField()


    nombre_places = models.IntegerField(
        default=1
    )


    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='OUVERT'
    )


    date_creation = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.titre
