from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CandidatureStageViewSet


router = DefaultRouter()

router.register(
    'candidatures',
    CandidatureStageViewSet,
    basename='candidature'
)


urlpatterns = [
    path('', include(router.urls)),
]