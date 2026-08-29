from rest_framework import serializers

from .models import Demande


class DemandeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Demande

        fields = [
            'id',
            'etudiant',
            'entreprise',
            'stage',
            'type_demande',
            'objet',
            'description',

            # =====================================================
            # DOCUMENTS
            # =====================================================

            'cv',
            'lettre_motivation_fichier',
            'lettre_motivation_texte',

            # =====================================================
            # STATUT
            # =====================================================

            'statut',
            'commentaire_admin',
            'date_demande',
            'date_traitement',
        ]

        read_only_fields = [
            'id',
            'etudiant',
            'statut',
            'commentaire_admin',
            'date_demande',
            'date_traitement',
        ]