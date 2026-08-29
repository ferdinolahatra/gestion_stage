from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import OffreStageViewSet


router = DefaultRouter()

router.register(
    'stages',
    OffreStageViewSet,
    basename='stage'
)


urlpatterns = [
    path('', include(router.urls)),
]