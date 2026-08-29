from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdmin

from accounts.models import User
from entreprises.models import Entreprise
from stages.models import OffreStage
from candidatures.models import CandidatureStage
from encadrement.models import Encadrement
from journal.models import JournalStage
from rapports.models import RapportStage
from evaluations.models import Evaluation


class DashboardStatsView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        # ==============================
        # UTILISATEURS
        # ==============================

        total_utilisateurs = User.objects.count()

        total_etudiants = User.objects.filter(
            role='ETUDIANT'
        ).count()

        total_enseignants = User.objects.filter(
            role='ENSEIGNANT'
        ).count()

        # ==============================
        # ENTREPRISES
        # ==============================

        total_entreprises = Entreprise.objects.count()

        # ==============================
        # OFFRES DE STAGE
        # ==============================

        total_offres = OffreStage.objects.count()

        offres_ouvertes = OffreStage.objects.filter(
            statut='OUVERT'
        ).count()

        offres_fermees = OffreStage.objects.filter(
            statut='FERME'
        ).count()

        # ==============================
        # CANDIDATURES
        # ==============================

        total_candidatures = CandidatureStage.objects.count()

        candidatures_en_attente = CandidatureStage.objects.filter(
            statut='EN_ATTENTE'
        ).count()

        candidatures_acceptees = CandidatureStage.objects.filter(
            statut='ACCEPTEE'
        ).count()

        candidatures_refusees = CandidatureStage.objects.filter(
            statut='REFUSEE'
        ).count()

        # ==============================
        # ENCADREMENTS
        # ==============================

        total_encadrements = Encadrement.objects.count()

        # ==============================
        # JOURNAUX DE STAGE
        # ==============================

        total_journaux = JournalStage.objects.count()

        # ==============================
        # RAPPORTS
        # ==============================

        total_rapports = RapportStage.objects.count()

        rapports_en_attente = RapportStage.objects.filter(
            statut='EN_ATTENTE'
        ).count()

        rapports_valides = RapportStage.objects.filter(
            statut='VALIDE'
        ).count()

        rapports_refuses = RapportStage.objects.filter(
            statut='REFUSE'
        ).count()

        # ==============================
        # EVALUATIONS
        # ==============================

        total_evaluations = Evaluation.objects.count()

        # ==============================
        # REPONSE
        # ==============================

        return Response({

            'utilisateurs': {
                'total': total_utilisateurs,
                'etudiants': total_etudiants,
                'enseignants': total_enseignants,
            },

            'entreprises': total_entreprises,

            'offres_stage': {
                'total': total_offres,
                'ouvertes': offres_ouvertes,
                'fermees': offres_fermees,
            },

            'candidatures': {
                'total': total_candidatures,
                'en_attente': candidatures_en_attente,
                'acceptees': candidatures_acceptees,
                'refusees': candidatures_refusees,
            },

            'encadrements': total_encadrements,

            'journaux': total_journaux,

            'rapports': {
                'total': total_rapports,
                'en_attente': rapports_en_attente,
                'valides': rapports_valides,
                'refuses': rapports_refuses,
            },

            'evaluations': total_evaluations,
        })