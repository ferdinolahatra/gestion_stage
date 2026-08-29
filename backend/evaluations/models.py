from django.db import models
from accounts.models import User
from stages.models import OffreStage


class Evaluation(models.Model):

    TYPE_EVALUATION_CHOICES = [
        ("ENTREPRISE", "Entreprise"),
        ("ENSEIGNANT", "Enseignant"),
    ]

    # ---------------------------------------------------------
    # ÉTUDIANT ÉVALUÉ
    # ---------------------------------------------------------

    etudiant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="evaluations_recues",
        null=True,
        blank=True,
        limit_choices_to={"role": "ETUDIANT"},
    )

    # ---------------------------------------------------------
    # STAGE
    # ---------------------------------------------------------

    stage = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )

    # ---------------------------------------------------------
    # UTILISATEUR QUI ÉVALUE
    # ---------------------------------------------------------

    evaluateur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="evaluations_effectuees",
        null=True,
        blank=True,
    )

    # ---------------------------------------------------------
    # TYPE
    # ---------------------------------------------------------

    type_evaluation = models.CharField(
        max_length=20,
        choices=TYPE_EVALUATION_CHOICES,
    )

    # ---------------------------------------------------------
    # NOTE
    # ---------------------------------------------------------

    note = models.DecimalField(
        max_digits=4,
        decimal_places=2,
    )

    # ---------------------------------------------------------
    # COMMENTAIRE
    # ---------------------------------------------------------

    commentaire = models.TextField(
        blank=False,
    )

    # ---------------------------------------------------------
    # DATE
    # ---------------------------------------------------------

    date_evaluation = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date_evaluation"]

        indexes = [
            models.Index(
                fields=[
                    "stage",
                    "type_evaluation",
                ]
            ),
            models.Index(
                fields=[
                    "etudiant",
                ]
            ),
        ]

    def __str__(self):

        nom = (
            self.etudiant.username
            if self.etudiant
            else "Étudiant"
        )

        return (
            f"{nom} - "
            f"{self.type_evaluation} - "
            f"{self.note}/20"
        )