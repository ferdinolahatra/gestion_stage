from django.db import models

from accounts.models import User


class Activity(models.Model):

    ACTION_CHOICES = (
        ('USER_CREATED', 'Utilisateur créé'),
        ('USER_UPDATED', 'Utilisateur modifié'),
        ('USER_DELETED', 'Utilisateur supprimé'),

        ('COMPANY_CREATED', 'Entreprise créée'),
        ('COMPANY_UPDATED', 'Entreprise modifiée'),

        ('STAGE_CREATED', 'Offre de stage créée'),
        ('STAGE_UPDATED', 'Offre de stage modifiée'),
        ('STAGE_CLOSED', 'Offre de stage fermée'),

        ('APPLICATION_CREATED', 'Candidature déposée'),
        ('APPLICATION_ACCEPTED', 'Candidature acceptée'),
        ('APPLICATION_REFUSED', 'Candidature refusée'),

        ('SUPERVISION_CREATED', 'Encadrement créé'),

        ('JOURNAL_CREATED', 'Journal de stage créé'),

        ('REPORT_CREATED', 'Rapport déposé'),
        ('REPORT_VALIDATED', 'Rapport validé'),
        ('REPORT_REFUSED', 'Rapport refusé'),

        ('EVALUATION_CREATED', 'Évaluation créée'),
    )

    actor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activities'
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )

    description = models.TextField()

    entity_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    entity_id = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.actor.username} - {self.action}"


class Notification(models.Model):

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    actor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_notifications'
    )

    action = models.CharField(
        max_length=50,
        choices=Activity.ACTION_CHOICES
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    entity_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    entity_id = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    is_read = models.BooleanField(
        default=False
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"