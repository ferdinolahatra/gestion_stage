from rest_framework import serializers

from .models import CandidatureStage


class CandidatureStageSerializer(
    serializers.ModelSerializer
):

    # =====================================================
    # INFORMATIONS ÉTUDIANT
    # =====================================================

    etudiant_nom = serializers.CharField(
        source='etudiant.username',
        read_only=True
    )

    etudiant_prenom = serializers.CharField(
        source='etudiant.first_name',
        read_only=True
    )

    etudiant_nom_famille = serializers.CharField(
        source='etudiant.last_name',
        read_only=True
    )

    etudiant_email = serializers.EmailField(
        source='etudiant.email',
        read_only=True
    )

    # =====================================================
    # AUTRES INFORMATIONS ÉVENTUELLES
    # =====================================================

    etudiant_telephone = serializers.SerializerMethodField()

    etudiant_date_naissance = serializers.SerializerMethodField()

    # =====================================================
    # OFFRE
    # =====================================================

    offre_stage_nom = serializers.CharField(
        source='offre_stage.titre',
        read_only=True
    )

    # =====================================================
    # DEMANDE D'ORIGINE
    # =====================================================

    demande_id = serializers.IntegerField(
        source='demande.id',
        read_only=True
    )

    demande_objet = serializers.CharField(
        source='demande.objet',
        read_only=True
    )

    demande_description = serializers.CharField(
        source='demande.description',
        read_only=True
    )

    demande_type = serializers.CharField(
        source='demande.type_demande',
        read_only=True
    )

    demande_entreprise = serializers.SerializerMethodField()

    # =====================================================
    # TELEPHONE
    # =====================================================

    def get_etudiant_telephone(self, obj):

        user = obj.etudiant

        if hasattr(user, 'telephone'):
            return user.telephone

        if hasattr(user, 'phone'):
            return user.phone

        return None

    # =====================================================
    # DATE DE NAISSANCE
    # =====================================================

    def get_etudiant_date_naissance(self, obj):

        user = obj.etudiant

        if hasattr(user, 'date_naissance'):
            return user.date_naissance

        return None

    # =====================================================
    # ENTREPRISE
    # =====================================================

    def get_demande_entreprise(self, obj):

        if not obj.demande:
            return None

        entreprise = obj.demande.entreprise

        if not entreprise:
            return None

        return {
            'id': entreprise.id,
            'nom': getattr(
                entreprise,
                'nom',
                str(entreprise)
            ),
        }

    # =====================================================
    # META
    # =====================================================

    class Meta:

        model = CandidatureStage

        fields = [

            'id',

            # -------------------------------------------------
            # DEMANDE
            # -------------------------------------------------

            'demande_id',
            'demande_objet',
            'demande_description',
            'demande_type',
            'demande_entreprise',

            # -------------------------------------------------
            # ETUDIANT
            # -------------------------------------------------

            'etudiant',

            'etudiant_nom',
            'etudiant_prenom',
            'etudiant_nom_famille',
            'etudiant_email',
            'etudiant_telephone',
            'etudiant_date_naissance',

            # -------------------------------------------------
            # OFFRE
            # -------------------------------------------------

            'offre_stage',
            'offre_stage_nom',

            # -------------------------------------------------
            # DOCUMENTS
            # -------------------------------------------------

            'lettre_motivation',
            'lettre_motivation_fichier',
            'cv',

            # -------------------------------------------------
            # STATUT
            # -------------------------------------------------

            'statut',

            # -------------------------------------------------
            # DATE
            # -------------------------------------------------

            'date_candidature',
        ]

        read_only_fields = [
            'id',

            'demande_id',
            'demande_objet',
            'demande_description',
            'demande_type',
            'demande_entreprise',

            'etudiant_nom',
            'etudiant_prenom',
            'etudiant_nom_famille',
            'etudiant_email',
            'etudiant_telephone',
            'etudiant_date_naissance',

            'offre_stage_nom',

            'date_candidature',
        ]