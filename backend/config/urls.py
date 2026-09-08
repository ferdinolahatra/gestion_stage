from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from accounts.views import CustomTokenObtainPairView


urlpatterns = [

    # Interface Administration
    path('admin/', admin.site.urls),

    # Authentification JWT personnalisée
    path(
        'api/token/',
        CustomTokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    # API Accounts
    path(
        'api/',
        include('accounts.urls')
    ),

    # API Entreprises
    path(
        'api/',
        include('entreprises.urls')
    ),

    # API Candidatures
    path(
        'api/',
        include('candidatures.urls')
    ),

    # API Stages
    path(
        'api/',
        include('stages.urls')
    ),

    # API Encadrement
    path(
        'api/',
        include('encadrement.urls')
    ),

    # API Journal
    path(
        'api/',
        include('journal.urls')
    ),

    # API Rapports
    path(
        'api/',
        include('rapports.urls')
    ),

    # API Évaluations
    path(
        'api/',
        include('evaluations.urls')
    ),

    # API Dashboard
    path(
        'api/dashboard/',
        include('dashboard.urls')
    ),

    # API Notifications
    path(
        'api/',
        include('notifications.urls')
    ),

    # API Demandes
    path(
        'api/',
        include('demandes.urls')
    ),

    # API Statistiques
    path(
        'api/statistiques/',
        include('statistiques.urls')
    ),
]


# Service des fichiers médias en mode DEBUG
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )