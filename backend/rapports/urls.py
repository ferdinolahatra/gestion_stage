from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import RapportStageViewSet


router = DefaultRouter()

router.register(
    'rapports',
    RapportStageViewSet,
    basename='rapport'
)


urlpatterns = [
    path('', include(router.urls)),
]