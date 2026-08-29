from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .authentication import CustomTokenObtainPairSerializer
from .permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by('-date_creation')

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    'message': 'Inscription réussie.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class CustomTokenObtainPairView(TokenObtainPairView):

    serializer_class = CustomTokenObtainPairSerializer