from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import EncadrementViewSet


router = DefaultRouter()

router.register(
    'encadrements',
    EncadrementViewSet,
    basename='encadrement'
)


urlpatterns = [
    path('', include(router.urls)),
]