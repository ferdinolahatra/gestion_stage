import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./History.css";

function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadActivities();
  }, [isAdmin]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("activities/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setActivities(data);
    } catch (error) {
      console.error("Erreur historique :", error);

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError("L'accès à l'historique est réservé aux administrateurs.");
      } else {
        setError("Impossible de charger l'historique.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (action) => {
    if (!action) return "OTHER";
    if (action.includes("USER")) return "USERS";
    if (action.includes("COMPANY") || action.includes("ENTREPRISE")) return "COMPANIES";
    if (action.includes("STAGE")) return "STAGES";
    if (action.includes("APPLICATION")) return "APPLICATIONS";
    if (action.includes("SUPERVISION")) return "SUPERVISIONS";
    if (action.includes("JOURNAL")) return "JOURNALS";
    if (action.includes("REPORT")) return "REPORTS";
    if (action.includes("EVALUATION")) return "EVALUATIONS";

    return "OTHER";
  };

  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const category = getCategory(activity.action);

      const matchesFilter = filter === "ALL" || category === filter;

      if (!matchesFilter) return false;
      if (!term) return true;

      return [
        activity.actor_username,
        activity.action_label,
        activity.description,
        activity.entity_type,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [activities, search, filter]);

  const formatDate = (value) => {
    if (!value) return "Date inconnue";

    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderIcon = (action) => {
    const category = getCategory(action);

    switch (category) {
      case "USERS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case "COMPANIES":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
          </svg>
        );
      case "STAGES":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      case "APPLICATIONS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case "SUPERVISIONS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "JOURNALS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      case "REPORTS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case "EVALUATIONS":
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      default:
        return (
          <svg className="history-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      ALL: "Toutes",
      USERS: "Utilisateurs",
      COMPANIES: "Entreprises",
      STAGES: "Stages",
      APPLICATIONS: "Candidatures",
      SUPERVISIONS: "Encadrements",
      JOURNALS: "Journaux",
      REPORTS: "Rapports",
      EVALUATIONS: "Évaluations",
    };

    return labels[category] || category;
  };

  /* =========================================
     ACCÈS REFUSÉ
  ========================================= */

  if (!isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-icon-wrapper">
            <div className="access-denied-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <span className="access-denied-label">ACCÈS RESTREINT</span>

          <h1>Accès refusé</h1>

          <p>Cette section est réservée exclusivement aux administrateurs de la plateforme.</p>

          <div className="access-denied-line" />

          <div className="access-denied-info">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>

            <div>
              <strong>Autorisation requise</strong>
              <small>Connectez-vous avec un compte administrateur pour consulter l'historique des activités.</small>
            </div>
          </div>

          <button className="access-denied-button" onClick={() => (window.location.href = "/dashboard")}>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     CHARGEMENT
  ========================================= */

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-state">
          <div className="history-spinner" />
          <p>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  /* =========================================
     ERREUR
  ========================================= */

  if (error) {
    return (
      <div className="history-page">
        <div className="history-state history-error">
          <div className="history-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2>Impossible de charger l'historique</h2>

          <p>{error}</p>

          <button className="history-retry-button" onClick={loadActivities}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
     HISTORIQUE
  ========================================= */

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <div className="history-breadcrumb">
            Administration
            <span>/</span>
            Historique
          </div>

          <span className="history-kicker">JOURNAL D'ACTIVITÉ</span>

          <h1>Historique des activités</h1>

          <p>Consultez toutes les actions effectuées sur la plateforme.</p>
        </div>

        <div className="history-summary">
          <strong>{activities.length}</strong>
          <span>activité(s)</span>
        </div>
      </div>

      <div className="history-toolbar">
        <div className="history-search">
          <span className="history-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une activité..."
          />
        </div>

        <button className="history-refresh" onClick={loadActivities}>
          <svg className="history-refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Actualiser
        </button>
      </div>

      <div className="history-filters">
        {[
          "ALL",
          "USERS",
          "COMPANIES",
          "STAGES",
          "APPLICATIONS",
          "SUPERVISIONS",
          "JOURNALS",
          "REPORTS",
          "EVALUATIONS",
        ].map((category) => (
          <button
            key={category}
            className={filter === category ? "history-filter active" : "history-filter"}
            onClick={() => setFilter(category)}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="history-card">
        <div className="history-card-header">
          <div>
            <h2>Activités récentes</h2>
            <p>{filteredActivities.length} activité(s) affichée(s)</p>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>

            <h3>Aucune activité trouvée</h3>

            <p>Aucune activité ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredActivities.map((activity) => (
              <div className="history-item" key={activity.id}>
                <div className="history-item-icon">
                  {renderIcon(activity.action)}
                </div>

                <div className="history-item-main">
                  <div className="history-item-top">
                    <strong>{activity.action_label || activity.action}</strong>

                    <span>{formatDate(activity.date_creation)}</span>
                  </div>

                  <p>{activity.description}</p>

                  <div className="history-item-meta">
                    <span className="history-meta-user">
                      <svg className="history-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {activity.actor_username || "Utilisateur"}
                    </span>

                    {activity.entity_type && <span>{activity.entity_type}</span>}

                    {activity.entity_id && <span>#{activity.entity_id}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;