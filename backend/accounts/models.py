from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (

        ('ADMIN', 'Administrateur'),

        ('ETUDIANT', 'Étudiant'),

        ('ENSEIGNANT', 'Enseignant'),

        ('ENTREPRISE', 'Entreprise'),

    )


    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='ETUDIANT'
    )


    telephone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )


    date_creation = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):

        return f"{self.username} - {self.role}"
