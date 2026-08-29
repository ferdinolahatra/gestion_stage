from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from accounts.views import CustomTokenObtainPairView


urlpatterns = [

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

    path(
    'api/',
    include('candidatures.urls')
  
    ),
 

    path(
    'api/',
    include('stages.urls')
    ),

    path(
    'api/',
    include('encadrement.urls')
    ),

    path(
    'api/',
    include('journal.urls')
    ),

    path(
    'api/',
    include('rapports.urls')
    ),

    path(
    'api/',
    include('evaluations.urls')
    ),

    path(
    'api/dashboard/',
    include('dashboard.urls')
    ),


    path(
    'api/',
    include('notifications.urls')
    ),

    path(
    'api/',
    include('demandes.urls')
    ),

    path(
    'api/statistiques/',
    include('statistiques.urls')
    ),
]


if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )