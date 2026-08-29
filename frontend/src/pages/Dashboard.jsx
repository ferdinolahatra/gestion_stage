import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Sidebar from "../components/Sidebar";

import {
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Star,
  History,
  Clock3,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard({
  darkMode,
  setDarkMode,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* =================================================
     CHARGEMENT DU DASHBOARD
  ================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("dashboard/");

        setStats(response.data);

      } catch (error) {

        console.error(
          "Erreur Dashboard :",
          error
        );

        if (error.response?.status === 401) {

          setError(
            "Votre session a expiré."
          );

        } else if (error.response?.status === 403) {

          setError("ACCES_ADMIN");

        } else {

          setError(
            "Impossible de charger le Dashboard."
          );
        }

      } finally {

        setLoading(false);

      }
    };

    loadDashboard();

  }, []);


  /* =================================================
     SIDEBAR
  ================================================= */

  const renderSidebar = () => (
    <Sidebar
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );


  /* =================================================
     CHARGEMENT
  ================================================= */

  if (loading) {

    return (
      <div className="dashboard-layout">

        {renderSidebar()}

        <main className="dashboard-main">

          <div className="dashboard-loading">

            <div className="dashboard-loading-card">

              <div className="dashboard-spinner"></div>

              <h3>
                Chargement du Dashboard
              </h3>

              <p>
                Préparation de vos données...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }


  /* =================================================
     ACCÈS ADMIN REFUSÉ
  ================================================= */

  if (error === "ACCES_ADMIN") {

    const handleDashboardBack = () => {

      if (window.history.length > 1) {

        navigate(-1);

      } else {

        navigate("/entreprises");

      }

    };

    return (
      <div className="dashboard-layout">

        {renderSidebar()}

        <main className="dashboard-main">

          <div className="dashboard-access-denied">

            <div className="dashboard-access-card">

              {/* Icône */}

              <div className="dashboard-access-icon-wrapper">

                <div className="dashboard-access-icon">

                  <ShieldAlert
                    size={42}
                    strokeWidth={1.8}
                  />

                </div>

              </div>


              {/* Label */}

              <span className="dashboard-access-label">

                ACCÈS RESTREINT

              </span>


              {/* Titre */}

              <h1>
                Accès refusé
              </h1>


              {/* Message */}

              <p>

                Le Dashboard d'administration est
                réservé exclusivement aux administrateurs
                de la plateforme.

              </p>


              {/* Ligne */}

              <div className="dashboard-access-line"></div>


              {/* Information */}

              <div className="dashboard-access-info">

                <div className="dashboard-access-info-icon">

                  <Users
                    size={20}
                    strokeWidth={2}
                  />

                </div>

                <div>

                  <strong>
                    Autorisation requise
                  </strong>

                  <small>

                    Votre compte ne possède pas les droits
                    nécessaires pour consulter cette page.

                  </small>

                </div>

              </div>


              {/* Retour */}

              <button
                type="button"
                className="dashboard-access-button"
                onClick={handleDashboardBack}
              >

                <span>
                  ←
                </span>

                Retour

              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }


  /* =================================================
     AUTRE ERREUR
  ================================================= */

  if (error) {

    return (
      <div className="dashboard-layout">

        {renderSidebar()}

        <main className="dashboard-main">

          <div className="dashboard-error">

            <div className="dashboard-error-icon">

              <XCircle
                size={42}
                strokeWidth={1.8}
              />

            </div>


            <h2>
              Impossible de charger le Dashboard
            </h2>


            <p>
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >

              <RefreshCw
                size={17}
                strokeWidth={2}
              />

              Réessayer

            </button>

          </div>

        </main>

      </div>
    );
  }


  /* =================================================
     DASHBOARD NORMAL
  ================================================= */

  return (
    <div className="dashboard-layout">

      {renderSidebar()}

      <main className="dashboard-main">

        {/* =================================================
            EN-TÊTE
        ================================================= */}

        <div className="dashboard-header">

          <div className="dashboard-header-content">

            <span className="dashboard-kicker">

              ESPACE ADMINISTRATEUR

            </span>

            <h1>
              Tableau de bord
            </h1>

            <p>

              Vue générale de la plateforme de gestion
              des stages.

            </p>

          </div>


          <div className="dashboard-header-actions">

            <button
              type="button"
              className="dashboard-history-button"
              onClick={() =>
                navigate("/history")
              }
            >

              <History
                size={18}
                strokeWidth={2}
              />

              <span>
                Historique
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            STATISTIQUES
        ================================================= */}

        <div className="dashboard-grid">


          {/* =================================================
              UTILISATEURS
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-users">

                <Users
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Utilisateurs
              </span>

            </div>


            <strong className="stat-value">

              {stats.utilisateurs.total}

            </strong>


            <small className="stat-description">

              {stats.utilisateurs.etudiants} étudiants ·{" "}
              {stats.utilisateurs.enseignants} enseignants

            </small>

          </div>


          {/* =================================================
              ENTREPRISES
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-company">

                <Building2
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Entreprises
              </span>

            </div>


            <strong className="stat-value">

              {stats.entreprises}

            </strong>


            <small className="stat-description">

              Entreprises enregistrées

            </small>

          </div>


          {/* =================================================
              OFFRES
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-stages">

                <BriefcaseBusiness
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Offres de stage
              </span>

            </div>


            <strong className="stat-value">

              {stats.offres_stage.total}

            </strong>


            <small className="stat-description">

              {stats.offres_stage.ouvertes} ouvertes ·{" "}
              {stats.offres_stage.fermees} fermées

            </small>

          </div>


          {/* =================================================
              CANDIDATURES
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-candidatures">

                <FileText
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Candidatures
              </span>

            </div>


            <strong className="stat-value">

              {stats.candidatures.total}

            </strong>


            <small className="stat-description">

              {stats.candidatures.en_attente} en attente

            </small>

          </div>


          {/* =================================================
              ENCADREMENTS
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-encadrement">

                <GraduationCap
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Encadrements
              </span>

            </div>


            <strong className="stat-value">

              {stats.encadrements}

            </strong>


            <small className="stat-description">

              Encadrements enregistrés

            </small>

          </div>


          {/* =================================================
              JOURNAUX
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-journaux">

                <BookOpen
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Journaux
              </span>

            </div>


            <strong className="stat-value">

              {stats.journaux}

            </strong>


            <small className="stat-description">

              Journaux de stage

            </small>

          </div>


          {/* =================================================
              RAPPORTS
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-rapports">

                <ClipboardList
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Rapports
              </span>

            </div>


            <strong className="stat-value">

              {stats.rapports.total}

            </strong>


            <small className="stat-description">

              {stats.rapports.valides} validés ·{" "}
              {stats.rapports.en_attente} en attente

            </small>

          </div>


          {/* =================================================
              ÉVALUATIONS
          ================================================= */}

          <div className="stat-card">

            <div className="stat-card-top">

              <div className="stat-icon stat-icon-evaluations">

                <Star
                  size={21}
                  strokeWidth={2}
                />

              </div>

              <span className="stat-label">
                Évaluations
              </span>

            </div>


            <strong className="stat-value">

              {stats.evaluations}

            </strong>


            <small className="stat-description">

              Évaluations enregistrées

            </small>

          </div>

        </div>


        {/* =================================================
            ÉTATS
        ================================================= */}

        <div className="dashboard-sections">


          {/* =================================================
              CANDIDATURES
          ================================================= */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <span className="panel-kicker">
                  SUIVI
                </span>

                <h2>
                  État des candidatures
                </h2>

              </div>

              <FileText
                size={21}
                strokeWidth={2}
              />

            </div>


            <div className="status-row">

              <div className="status-label">

                <Clock3
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  En attente
                </span>

              </div>

              <strong>
                {stats.candidatures.en_attente}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">

                <CheckCircle2
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Acceptées
                </span>

              </div>

              <strong>
                {stats.candidatures.acceptees}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">

                <XCircle
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Refusées
                </span>

              </div>

              <strong>
                {stats.candidatures.refusees}
              </strong>

            </div>

          </div>


          {/* =================================================
              RAPPORTS
          ================================================= */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <span className="panel-kicker">
                  SUIVI
                </span>

                <h2>
                  État des rapports
                </h2>

              </div>

              <ClipboardList
                size={21}
                strokeWidth={2}
              />

            </div>


            <div className="status-row">

              <div className="status-label">

                <Clock3
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  En attente
                </span>

              </div>

              <strong>
                {stats.rapports.en_attente}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">

                <CheckCircle2
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Validés
                </span>

              </div>

              <strong>
                {stats.rapports.valides}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">

                <XCircle
                  size={17}
                  strokeWidth={2}
                />

                <span>
                  Refusés
                </span>

              </div>

              <strong>
                {stats.rapports.refuses}
              </strong>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;