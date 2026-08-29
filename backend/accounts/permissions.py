from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Autorise uniquement les administrateurs.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsEtudiant(BasePermission):
    """
    Autorise uniquement les étudiants.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ETUDIANT'
        )


class IsEnseignant(BasePermission):
    """
    Autorise uniquement les enseignants.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ENSEIGNANT'
        )


class IsEntreprise(BasePermission):
    """
    Autorise uniquement les entreprises.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ENTREPRISE'
        )


class IsAdminOrEnseignant(BasePermission):
    """
    Autorise les administrateurs et les enseignants.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'ENSEIGNANT']
        )


class IsAdminOrEntreprise(BasePermission):
    """
    Autorise les administrateurs et les entreprises.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'ENTREPRISE']
        )


class IsAdminOrEntrepriseOrReadOnly(BasePermission):
    """
    ADMIN et ENTREPRISE peuvent gérer les offres.
    Les autres utilisateurs authentifiés peuvent seulement consulter.
    """

    def has_permission(self, request, view):

        # L'utilisateur doit être connecté
        if not request.user.is_authenticated:
            return False

        # Tout utilisateur connecté peut consulter
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Seuls ADMIN et ENTREPRISE peuvent modifier
        return request.user.role in ['ADMIN', 'ENTREPRISE']