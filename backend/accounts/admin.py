from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    model = User

    list_display = (
        'username',
        'email',
        'role',
        'telephone',
        'is_staff',
        'is_active',
        'date_creation',
    )


    list_filter = (
        'role',
        'is_staff',
        'is_active',
    )


    fieldsets = UserAdmin.fieldsets + (

        (
            'Informations supplémentaires',
            {
                'fields': (
                    'role',
                    'telephone',
                )
            }
        ),

    )