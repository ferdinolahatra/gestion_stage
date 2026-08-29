from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Activity, Notification
from .serializers import (
    ActivitySerializer,
    NotificationSerializer,
)


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ADMIN :
        # peut voir tout l'historique
        if user.role == 'ADMIN':
            return Activity.objects.all()

        # AUTRES UTILISATEURS :
        # voient uniquement leurs propres activités
        return Activity.objects.filter(
            actor=user
        )


class NotificationViewSet(viewsets.ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        return Notification.objects.filter(
            recipient=user
        )

    @action(
        detail=True,
        methods=['patch'],
        url_path='read'
    )
    def mark_as_read(self, request, pk=None):

        notification = self.get_object()

        notification.is_read = True
        notification.save(
            update_fields=['is_read']
        )

        return Response({
            'message': 'Notification marquée comme lue.',
            'is_read': True,
        })

    @action(
        detail=False,
        methods=['patch'],
        url_path='read-all'
    )
    def mark_all_as_read(self, request):

        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response({
            'message': 'Toutes les notifications ont été marquées comme lues.',
            'updated': updated,
        })