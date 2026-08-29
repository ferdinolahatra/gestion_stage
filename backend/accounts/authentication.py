from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["role"] = user.role
        token["username"] = user.username

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data["user"] = {

            "id": self.user.id,

            "username": self.user.username,

            "email": self.user.email,

            "role": self.user.role,

            "first_name": self.user.first_name,

            "last_name": self.user.last_name,

        }

        return data