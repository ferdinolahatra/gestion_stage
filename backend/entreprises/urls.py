from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import EntrepriseViewSet


router = DefaultRouter()

router.register(
    'entreprises',
    EntrepriseViewSet,
    basename='entreprise'
)


urlpatterns = [
    path('', include(router.urls)),
]