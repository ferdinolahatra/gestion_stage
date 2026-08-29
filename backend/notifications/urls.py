from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    NotificationViewSet,
)


router = DefaultRouter()

router.register(
    'activities',
    ActivityViewSet,
    basename='activity'
)

router.register(
    'notifications',
    NotificationViewSet,
    basename='notification'
)


urlpatterns = [
    path(
        '',
        include(router.urls)
    ),
]