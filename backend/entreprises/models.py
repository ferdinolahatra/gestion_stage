from django.db import models

class Entreprise(models.Model):

    nom = models.CharField(
        max_length=200
    )

    secteur = models.CharField(
        max_length=200
    )

    adresse = models.TextField()

    email = models.EmailField()

    telephone = models.CharField(
        max_length=20
    )

    site_web = models.URLField(
        blank=True,
        null=True
    )

    responsable = models.CharField(
        max_length=150
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return self.nom
