import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import api from "../services/api";
import "./Statistiques.css";

function Statistiques() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatistiques = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("statistiques/");

      console.log("STATISTIQUES :", response.data);

      setStats(response.data);
    } catch (err) {
      console.error("Erreur statistiques :", err);

      setError(
        "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistiques();
  }, []);

  /* ==========================================
     CHARGEMENT
     ========================================== */

  if (loading) {
    return (
      <div className="statistiques-page">
        <div className="stats-loading">
          <div className="stats-spinner"></div>

          <p>
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================
     ERREUR
     ========================================== */

  if (error) {
    return (
      <div className="statistiques-page">
        <div className="stats-error">

          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            Erreur
          </h2>

          <p>
            {error}
          </p>

          <button
            className="stats-retry"
            onClick={loadStatistiques}
          >
            Réessayer
          </button>

        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  /* ==========================================
     DONNÉES
     ========================================== */

  const utilisateurs = stats.utilisateurs || {};
  const entreprises = stats.entreprises || {};
  const offres = stats.offres_stage || {};
  const candidatures = stats.candidatures || {};
  const encadrements = stats.encadrements || {};
  const journaux = stats.journaux || {};
  const rapports = stats.rapports || {};
  const evaluations = stats.evaluations || {};
  const demandes = stats.demandes || {};

  /* ==========================================
     GRAPHIQUE GLOBAL
     ========================================== */

  const plateformeData = [
    {
      name: "Utilisateurs",
      total: utilisateurs.total || 0,
    },
    {
      name: "Entreprises",
      total: entreprises.total || 0,
    },
    {
      name: "Offres",
      total: offres.total || 0,
    },
    {
      name: "Candidatures",
      total: candidatures.total || 0,
    },
    {
      name: "Encadrements",
      total: encadrements.total || 0,
    },
    {
      name: "Journaux",
      total: journaux.total || 0,
    },
    {
      name: "Rapports",
      total: rapports.total || 0,
    },
    {
      name: "Évaluations",
      total: evaluations.total || 0,
    },
    {
      name: "Demandes",
      total: demandes.total || 0,
    },
  ];

  /* ==========================================
     UTILISATEURS
     ========================================== */

  const utilisateursData = [
    {
      name: "Étudiants",
      value: utilisateurs.etudiants || 0,
    },
    {
      name: "Enseignants",
      value: utilisateurs.enseignants || 0,
    },
    {
      name: "Entreprises",
      value: utilisateurs.entreprises || 0,
    },
    {
      name: "Administrateurs",
      value: utilisateurs.admins || 0,
    },
  ];

  /* ==========================================
     CANDIDATURES
     ========================================== */

  const candidaturesData = [
    {
      name: "En attente",
      value: candidatures.en_attente || 0,
    },
    {
      name: "Acceptées",
      value: candidatures.acceptees || 0,
    },
    {
      name: "Refusées",
      value: candidatures.refusees || 0,
    },
  ];

  /* ==========================================
     DEMANDES
     ========================================== */

  const demandesData = [
    {
      name: "En attente",
      value: demandes.en_attente || 0,
    },
    {
      name: "Validées",
      value: demandes.validees || 0,
    },
    {
      name: "Refusées",
      value: demandes.refusees || 0,
    },
  ];

  /* ==========================================
     RAPPORTS
     ========================================== */

  const rapportsData = [
    {
      name: "En attente",
      value: rapports.en_attente || 0,
    },
    {
      name: "Validés",
      value: rapports.valides || 0,
    },
    {
      name: "Refusés",
      value: rapports.refuses || 0,
    },
  ];

  /* ==========================================
     COULEURS
     ========================================== */

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#dc2626",
  ];

  const BLUE_COLORS = [
    "#2563eb",
    "#60a5fa",
    "#93c5fd",
  ];

  /* ==========================================
     RENDU
     ========================================== */

  return (
    <div className="statistiques-page">

      {/* ======================================
          HEADER
         ====================================== */}

      <div className="stats-header">

        <div>

          <span className="stats-overline">
            ADMINISTRATION
          </span>

          <h1>
            📊 Statistiques
          </h1>

          <p>
            Vue globale de l'activité de la
            plateforme de gestion des stages.
          </p>

        </div>

        <button
          className="stats-refresh"
          onClick={loadStatistiques}
        >
          ↻ Actualiser
        </button>

      </div>


      {/* ======================================
          CARTES PRINCIPALES
         ====================================== */}

      <div className="stats-cards">

        <div className="stats-card">

          <div className="stats-card-icon blue">
            👥
          </div>

          <div>
            <span>
              Utilisateurs
            </span>

            <strong>
              {utilisateurs.total || 0}
            </strong>
          </div>

        </div>


        <div className="stats-card">

          <div className="stats-card-icon green">
            🏢
          </div>

          <div>
            <span>
              Entreprises
            </span>

            <strong>
              {entreprises.total || 0}
            </strong>
          </div>

        </div>


        <div className="stats-card">

          <div className="stats-card-icon orange">
            📋
          </div>

          <div>
            <span>
              Offres de stage
            </span>

            <strong>
              {offres.total || 0}
            </strong>
          </div>

        </div>


        <div className="stats-card">

          <div className="stats-card-icon purple">
            📝
          </div>

          <div>
            <span>
              Candidatures
            </span>

            <strong>
              {candidatures.total || 0}
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================
          GRAPHIQUE GLOBAL
         ====================================== */}

      <div className="stats-grid">

        <section className="stats-panel large">

          <div className="panel-header">

            <div>

              <h2>
                Activité de la plateforme
              </h2>

              <p>
                Nombre d'éléments enregistrés
              </p>

            </div>

            <span className="panel-icon">
              📊
            </span>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={plateformeData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 60,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#2563eb"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* ==================================
            UTILISATEURS
           ================================== */}

        <section className="stats-panel">

          <div className="panel-header">

            <div>

              <h2>
                Utilisateurs
              </h2>

              <p>
                Répartition par rôle
              </p>

            </div>

            <span className="panel-icon">
              👥
            </span>

          </div>

          <div className="pie-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={utilisateursData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label
                >

                  {utilisateursData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-user-${index}`}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* ==================================
            CANDIDATURES
           ================================== */}

        <section className="stats-panel">

          <div className="panel-header">

            <div>

              <h2>
                Candidatures
              </h2>

              <p>
                État des candidatures
              </p>

            </div>

            <span className="panel-icon">
              📝
            </span>

          </div>

          <div className="pie-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={candidaturesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label
                >

                  {candidaturesData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-candidature-${index}`}
                        fill={
                          BLUE_COLORS[
                            index %
                            BLUE_COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* ==================================
            DEMANDES
           ================================== */}

        <section className="stats-panel">

          <div className="panel-header">

            <div>

              <h2>
                Demandes
              </h2>

              <p>
                État des demandes
              </p>

            </div>

            <span className="panel-icon">
              📤
            </span>

          </div>

          <div className="pie-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={demandesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label
                >

                  {demandesData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-demande-${index}`}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* ==================================
            RAPPORTS
           ================================== */}

        <section className="stats-panel">

          <div className="panel-header">

            <div>

              <h2>
                Rapports
              </h2>

              <p>
                État des rapports déposés
              </p>

            </div>

            <span className="panel-icon">
              📄
            </span>

          </div>

          <div className="pie-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={rapportsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label
                >

                  {rapportsData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-rapport-${index}`}
                        fill={
                          BLUE_COLORS[
                            index %
                            BLUE_COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* ==================================
            GRAPHIQUE DEMANDES
           ================================== */}

        <section className="stats-panel large">

          <div className="panel-header">

            <div>

              <h2>
                Suivi des demandes
              </h2>

              <p>
                Comparaison des différents statuts
              </p>

            </div>

            <span className="panel-icon">
              📈
            </span>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={demandesData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 10,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="value"
                  name="Demandes"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </section>

      </div>


      {/* ======================================
          FOOTER
         ====================================== */}

      <div className="stats-footer">

        <span>
          Dernière actualisation :
        </span>

        <strong>
          {new Date().toLocaleString("fr-FR")}
        </strong>

      </div>

    </div>
  );
}

export default Statistiques;