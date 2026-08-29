from .models import Activity, Notification
from accounts.models import User


def create_activity(
    actor,
    action,
    description,
    entity_type=None,
    entity_id=None,
):
    """
    Enregistre une activité dans l'historique.
    """

    return Activity.objects.create(
        actor=actor,
        action=action,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
    )


def notify_user(
    recipient,
    actor,
    action,
    title,
    message,
    entity_type=None,
    entity_id=None,
):
    """
    Crée une notification pour un utilisateur.
    """

    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        action=action,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
    )


def notify_admins(
    actor,
    action,
    title,
    message,
    entity_type=None,
    entity_id=None,
):
    """
    Crée une notification pour tous les administrateurs.
    """

    admins = User.objects.filter(
        role='ADMIN',
        is_active=True
    )

    notifications = []

    for admin in admins:

        notification = notify_user(
            recipient=admin,
            actor=actor,
            action=action,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
        )

        notifications.append(notification)

    return notifications


def log_and_notify_admins(
    actor,
    action,
    description,
    title,
    message,
    entity_type=None,
    entity_id=None,
):
    """
    Enregistre l'activité puis notifie les administrateurs.
    """

    activity = create_activity(
        actor=actor,
        action=action,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
    )

    notifications = notify_admins(
        actor=actor,
        action=action,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
    )

    return activity, notifications