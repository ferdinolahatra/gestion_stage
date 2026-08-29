from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from accounts.models import User
from entreprises.models import Entreprise
from stages.models import OffreStage
from candidatures.models import CandidatureStage
from encadrement.models import Encadrement
from journal.models import JournalStage
from rapports.models import RapportStage
from evaluations.models import Evaluation
from demandes.models import Demande


class StatistiquesView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        # ==========================================
        # ADMIN UNIQUEMENT
        # ==========================================

        if user.role != 'ADMIN':
            raise PermissionDenied(
                "Accès réservé à l'administrateur."
            )

        # ==========================================
        # UTILISATEURS
        # ==========================================

        utilisateurs_total = User.objects.count()

        utilisateurs_etudiants = User.objects.filter(
            role='ETUDIANT'
        ).count()

        utilisateurs_enseignants = User.objects.filter(
            role='ENSEIGNANT'
        ).count()

        utilisateurs_entreprises = User.objects.filter(
            role='ENTREPRISE'
        ).count()

        utilisateurs_admins = User.objects.filter(
            role='ADMIN'
        ).count()

        # ==========================================
        # ENTREPRISES
        # ==========================================

        entreprises_total = Entreprise.objects.count()

        # ==========================================
        # OFFRES DE STAGE
        # ==========================================

        offres_total = OffreStage.objects.count()

        offres_ouvertes = OffreStage.objects.filter(
            statut='OUVERT'
        ).count()

        offres_fermees = OffreStage.objects.filter(
            statut='FERME'
        ).count()

        # ==========================================
        # CANDIDATURES
        # ==========================================

        candidatures_total = CandidatureStage.objects.count()

        candidatures_en_attente = CandidatureStage.objects.filter(
            statut='EN_ATTENTE'
        ).count()

        candidatures_acceptees = CandidatureStage.objects.filter(
            statut='ACCEPTEE'
        ).count()

        candidatures_refusees = CandidatureStage.objects.filter(
            statut='REFUSEE'
        ).count()

        # ==========================================
        # ENCADREMENTS
        # ==========================================

        encadrements_total = Encadrement.objects.count()

        # ==========================================
        # JOURNAUX
        # ==========================================

        journaux_total = JournalStage.objects.count()

        # ==========================================
        # RAPPORTS
        # ==========================================

        rapports_total = RapportStage.objects.count()

        rapports_en_attente = RapportStage.objects.filter(
            statut='EN_ATTENTE'
        ).count()

        rapports_valides = RapportStage.objects.filter(
            statut='VALIDE'
        ).count()

        rapports_refuses = RapportStage.objects.filter(
            statut='REFUSE'
        ).count()

        # ==========================================
        # EVALUATIONS
        # ==========================================

        evaluations_total = Evaluation.objects.count()

        evaluations_enseignant = Evaluation.objects.filter(
            type_evaluation='ENSEIGNANT'
        ).count()

        evaluations_entreprise = Evaluation.objects.filter(
            type_evaluation='ENTREPRISE'
        ).count()

        # ==========================================
        # DEMANDES
        # ==========================================

        demandes_total = Demande.objects.count()

        demandes_en_attente = Demande.objects.filter(
            statut='EN_ATTENTE'
        ).count()

        demandes_validees = Demande.objects.filter(
            statut='VALIDEE'
        ).count()

        demandes_refusees = Demande.objects.filter(
            statut='REFUSEE'
        ).count()

        # ==========================================
        # REPONSE
        # ==========================================

        return Response({

            "utilisateurs": {
                "total": utilisateurs_total,
                "etudiants": utilisateurs_etudiants,
                "enseignants": utilisateurs_enseignants,
                "entreprises": utilisateurs_entreprises,
                "admins": utilisateurs_admins,
            },

            "entreprises": {
                "total": entreprises_total,
            },

            "offres_stage": {
                "total": offres_total,
                "ouvertes": offres_ouvertes,
                "fermees": offres_fermees,
            },

            "candidatures": {
                "total": candidatures_total,
                "en_attente": candidatures_en_attente,
                "acceptees": candidatures_acceptees,
                "refusees": candidatures_refusees,
            },

            "encadrements": {
                "total": encadrements_total,
            },

            "journaux": {
                "total": journaux_total,
            },

            "rapports": {
                "total": rapports_total,
                "en_attente": rapports_en_attente,
                "valides": rapports_valides,
                "refuses": rapports_refuses,
            },

            "evaluations": {
                "total": evaluations_total,
                "enseignant": evaluations_enseignant,
                "entreprise": evaluations_entreprise,
            },

            "demandes": {
                "total": demandes_total,
                "en_attente": demandes_en_attente,
                "validees": demandes_validees,
                "refusees": demandes_refusees,
            },

        })