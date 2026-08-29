from rest_framework import serializers

from .models import Activity, Notification


class ActivitySerializer(serializers.ModelSerializer):

    actor_username = serializers.CharField(
        source='actor.username',
        read_only=True
    )

    action_label = serializers.CharField(
        source='get_action_display',
        read_only=True
    )

    class Meta:
        model = Activity

        fields = [
            'id',
            'actor',
            'actor_username',
            'action',
            'action_label',
            'description',
            'entity_type',
            'entity_id',
            'date_creation',
        ]

        read_only_fields = [
            'id',
            'actor',
            'actor_username',
            'action_label',
            'date_creation',
        ]


class NotificationSerializer(serializers.ModelSerializer):

    actor_username = serializers.CharField(
        source='actor.username',
        read_only=True
    )

    class Meta:
        model = Notification

        fields = [
            'id',
            'recipient',
            'actor',
            'actor_username',
            'action',
            'title',
            'message',
            'entity_type',
            'entity_id',
            'is_read',
            'date_creation',
        ]

        read_only_fields = [
            'id',
            'recipient',
            'actor',
            'actor_username',
            'date_creation',
        ]