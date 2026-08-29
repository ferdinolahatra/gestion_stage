from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'telephone',
            'is_active',
            'date_creation',
        ]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'telephone',
            'role',
            'password',
            'password_confirm',
        ]

    def validate_username(self, value):

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Ce nom d'utilisateur existe déjà."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Cette adresse email existe déjà."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm":
                "Les mots de passe ne correspondent pas."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        # Empêcher l'inscription publique en tant qu'ADMIN
        if validated_data.get("role") == "ADMIN":
            validated_data["role"] = "ETUDIANT"

        user = User.objects.create(
            **validated_data
        )

        user.set_password(password)
        user.save()

        return user