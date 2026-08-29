import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./History.css";

function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

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
      console.error(
        "Erreur historique :",
        error
      );

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError(
          "L'accès à l'historique est réservé aux administrateurs."
        );
      } else {
        setError(
          "Impossible de charger l'historique."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (action) => {
    if (!action) {
      return "OTHER";
    }

    if (action.includes("USER")) {
      return "USERS";
    }

    if (
      action.includes("COMPANY") ||
      action.includes("ENTREPRISE")
    ) {
      return "COMPANIES";
    }

    if (action.includes("STAGE")) {
      return "STAGES";
    }

    if (action.includes("APPLICATION")) {
      return "APPLICATIONS";
    }

    if (action.includes("SUPERVISION")) {
      return "SUPERVISIONS";
    }

    if (action.includes("JOURNAL")) {
      return "JOURNALS";
    }

    if (action.includes("REPORT")) {
      return "REPORTS";
    }

    if (action.includes("EVALUATION")) {
      return "EVALUATIONS";
    }

    return "OTHER";
  };

  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const category = getCategory(
        activity.action
      );

      const matchesFilter =
        filter === "ALL" ||
        category === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        activity.actor_username,
        activity.action_label,
        activity.description,
        activity.entity_type,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term)
        );
    });
  }, [
    activities,
    search,
    filter,
  ]);

  const formatDate = (value) => {
    if (!value) {
      return "Date inconnue";
    }

    return new Date(value).toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getIcon = (action) => {
    const category = getCategory(action);

    switch (category) {
      case "USERS":
        return "👤";

      case "COMPANIES":
        return "🏢";

      case "STAGES":
        return "📋";

      case "APPLICATIONS":
        return "📝";

      case "SUPERVISIONS":
        return "👨‍🏫";

      case "JOURNALS":
        return "📔";

      case "REPORTS":
        return "📄";

      case "EVALUATIONS":
        return "⭐";

      default:
        return "•";
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
              🔒
            </div>
          </div>

          <span className="access-denied-label">
            ACCÈS RESTREINT
          </span>

          <h1>
            Accès refusé
          </h1>

          <p>
            Cette section est réservée exclusivement
            aux administrateurs de la plateforme.
          </p>

          <div className="access-denied-line" />

          <div className="access-denied-info">

            <span>
              👤
            </span>

            <div>
              <strong>
                Autorisation requise
              </strong>

              <small>
                Connectez-vous avec un compte administrateur
                pour consulter l'historique des activités.
              </small>
            </div>

          </div>

          <button
            className="access-denied-button"
            onClick={() =>
              window.location.href = "/dashboard"
            }
          >
            <span>
              ←
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

          <p>
            Chargement de l'historique...
          </p>

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
            !
          </div>

          <h2>
            Impossible de charger l'historique
          </h2>

          <p>
            {error}
          </p>

          <button
            className="history-retry-button"
            onClick={loadActivities}
          >
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

          <span className="history-kicker">
            JOURNAL D'ACTIVITÉ
          </span>

          <h1>
            Historique des activités
          </h1>

          <p>
            Consultez toutes les actions effectuées
            sur la plateforme.
          </p>

        </div>

        <div className="history-summary">

          <strong>
            {activities.length}
          </strong>

          <span>
            activité(s)
          </span>

        </div>

      </div>

      <div className="history-toolbar">

        <div className="history-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher une activité..."
          />

        </div>

        <button
          className="history-refresh"
          onClick={loadActivities}
        >
          ↻ Actualiser
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
            className={
              filter === category
                ? "history-filter active"
                : "history-filter"
            }
            onClick={() =>
              setFilter(category)
            }
          >
            {getCategoryLabel(category)}
          </button>
        ))}

      </div>

      <div className="history-card">

        <div className="history-card-header">

          <div>

            <h2>
              Activités récentes
            </h2>

            <p>
              {filteredActivities.length}
              {" "}
              activité(s) affichée(s)
            </p>

          </div>

        </div>

        {filteredActivities.length === 0 ? (

          <div className="history-empty">

            <div className="history-empty-icon">
              📋
            </div>

            <h3>
              Aucune activité trouvée
            </h3>

            <p>
              Aucune activité ne correspond
              à votre recherche.
            </p>

          </div>

        ) : (

          <div className="history-list">

            {filteredActivities.map(
              (activity) => (

                <div
                  className="history-item"
                  key={activity.id}
                >

                  <div className="history-item-icon">
                    {getIcon(
                      activity.action
                    )}
                  </div>

                  <div className="history-item-main">

                    <div className="history-item-top">

                      <strong>
                        {activity.action_label ||
                          activity.action}
                      </strong>

                      <span>
                        {formatDate(
                          activity.date_creation
                        )}
                      </span>

                    </div>

                    <p>
                      {activity.description}
                    </p>

                    <div className="history-item-meta">

                      <span>
                        👤{" "}
                        {activity.actor_username ||
                          "Utilisateur"}
                      </span>

                      {activity.entity_type && (
                        <span>
                          {activity.entity_type}
                        </span>
                      )}

                      {activity.entity_id && (
                        <span>
                          #{activity.entity_id}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default History;