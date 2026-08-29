from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import JournalStageViewSet


router = DefaultRouter()

router.register(
    'journaux',
    JournalStageViewSet,
    basename='journal'
)


urlpatterns = [
    path('', include(router.urls)),
]