import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./MesDemandes.css";

function MesDemandes() {
  const navigate = useNavigate();

  const [demandes, setDemandes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  const [selectedDemande, setSelectedDemande] =
    useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "demandes/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setDemandes(data);

    } catch (error) {
      console.error(
        "Erreur demandes :",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Votre session a expiré."
        );
      } else if (error.response?.status === 403) {
        setError(
          "Vous n'avez pas accès à vos demandes."
        );
      } else {
        setError(
          "Impossible de charger vos demandes."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "EN_ATTENTE":
        return "En attente";

      case "VALIDEE":
        return "Validée";

      case "REFUSEE":
        return "Refusée";

      default:
        return statut || "Inconnu";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "STAGE":
        return "Demande de stage";

      case "CONVENTION":
        return "Convention";

      case "AUTRE":
        return "Autre demande";

      default:
        return type || "—";
    }
  };

  const getStatutClass = (statut) => {
    switch (statut) {
      case "VALIDEE":
        return "demande-status status-valid";

      case "REFUSEE":
        return "demande-status status-refused";

      case "EN_ATTENTE":
      default:
        return "demande-status status-pending";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "VALIDEE":
        return "✓";

      case "REFUSEE":
        return "×";

      case "EN_ATTENTE":
      default:
        return "●";
    }
  };

  const getEntrepriseName = (demande) => {
    if (!demande.entreprise) {
      return "Aucune entreprise";
    }

    return `Entreprise #${demande.entreprise}`;
  };

  const getStageName = (demande) => {
    if (!demande.stage) {
      return "Aucun stage associé";
    }

    return `Stage #${demande.stage}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const filteredDemandes = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return demandes.filter((demande) => {

      const matchesStatut =
        filterStatut === "TOUS" ||
        demande.statut === filterStatut;

      if (!matchesStatut) {
        return false;
      }

      if (!value) {
        return true;
      }

      return [
        demande.objet,
        demande.description,
        demande.type_demande,
        getTypeLabel(
          demande.type_demande
        ),
        getEntrepriseName(
          demande
        ),
        getStageName(
          demande
        ),
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [
    demandes,
    search,
    filterStatut,
  ]);

  const stats = useMemo(() => {
    return {
      total: demandes.length,

      pending: demandes.filter(
        (demande) =>
          demande.statut ===
          "EN_ATTENTE"
      ).length,

      validated: demandes.filter(
        (demande) =>
          demande.statut ===
          "VALIDEE"
      ).length,

      refused: demandes.filter(
        (demande) =>
          demande.statut ===
          "REFUSEE"
      ).length,
    };
  }, [demandes]);

  if (user?.role !== "ETUDIANT") {
    return (
      <div className="mes-demandes-state">

        <div className="mes-demandes-state-icon">
          🔒
        </div>

        <h2>
          Accès refusé
        </h2>

        <p>
          Cette page est réservée aux étudiants.
        </p>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Retour
        </button>

      </div>
    );
  }

  if (loading) {
    return (
      <div className="mes-demandes-state">

        <div className="mes-demandes-spinner" />

        <p>
          Chargement de vos demandes...
        </p>

      </div>
    );
  }

  if (error) {
    return (
      <div className="mes-demandes-state mes-demandes-error">

        <div className="mes-demandes-state-icon">
          !
        </div>

        <h2>
          Impossible de charger
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={loadDemandes}
        >
          Réessayer
        </button>

      </div>
    );
  }

  return (
    <div className="mes-demandes-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="mes-demandes-header">

        <div>

          <div className="mes-demandes-breadcrumb">
            Espace étudiant
            <span>/</span>
            Mes demandes
          </div>

          <span className="mes-demandes-kicker">
            SUIVI DES DEMANDES
          </span>

          <h1>
            Mes demandes
          </h1>

          <p>
            Consultez l'état et le suivi
            de toutes vos demandes.
          </p>

        </div>

        <button
          className="mes-demandes-add-button"
          onClick={() =>
            navigate("/demandes/depot")
          }
        >
          <span>
            ＋
          </span>

          Nouvelle demande
        </button>

      </header>


      {/* =========================
          STATISTIQUES
      ========================= */}

      <section className="mes-demandes-stats">

        <div className="mes-demande-stat-card">

          <div className="mes-demande-stat-icon total">
            📨
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="mes-demande-stat-card">

          <div className="mes-demande-stat-icon pending">
            ●
          </div>

          <div>
            <span>
              En attente
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>


        <div className="mes-demande-stat-card">

          <div className="mes-demande-stat-icon valid">
            ✓
          </div>

          <div>
            <span>
              Validées
            </span>

            <strong>
              {stats.validated}
            </strong>
          </div>

        </div>


        <div className="mes-demande-stat-card">

          <div className="mes-demande-stat-icon refused">
            ×
          </div>

          <div>
            <span>
              Refusées
            </span>

            <strong>
              {stats.refused}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          TOOLBAR
      ========================= */}

      <section className="mes-demandes-toolbar">

        <div className="mes-demandes-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Rechercher une demande..."
          />

        </div>


        <div className="mes-demandes-filters">

          <button
            className={
              filterStatut === "TOUS"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatut(
                "TOUS"
              )
            }
          >
            Toutes
          </button>

          <button
            className={
              filterStatut ===
              "EN_ATTENTE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatut(
                "EN_ATTENTE"
              )
            }
          >
            En attente
          </button>

          <button
            className={
              filterStatut ===
              "VALIDEE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatut(
                "VALIDEE"
              )
            }
          >
            Validées
          </button>

          <button
            className={
              filterStatut ===
              "REFUSEE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatut(
                "REFUSEE"
              )
            }
          >
            Refusées
          </button>

        </div>

      </section>


      {/* =========================
          LISTE
      ========================= */}

      <section className="mes-demandes-card">

        <div className="mes-demandes-card-header">

          <div>
            <h2>
              Historique de mes demandes
            </h2>

            <p>
              {filteredDemandes.length}
              {" "}
              demande(s) affichée(s)
            </p>
          </div>

          <button
            className="mes-demandes-refresh"
            onClick={loadDemandes}
          >
            ↻ Actualiser
          </button>

        </div>


        {filteredDemandes.length ===
        0 ? (

          <div className="mes-demandes-empty">

            <div className="mes-demandes-empty-icon">
              📨
            </div>

            <h3>
              Aucune demande trouvée
            </h3>

            <p>
              Vous n'avez encore aucune demande
              correspondant à votre recherche.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/demandes/depot"
                )
              }
            >
              Déposer une demande
            </button>

          </div>

        ) : (

          <div className="mes-demandes-table-wrapper">

            <table className="mes-demandes-table">

              <thead>

                <tr>

                  <th>
                    Demande
                  </th>

                  <th>
                    Entreprise
                  </th>

                  <th>
                    Stage
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredDemandes.map(
                  (demande) => (

                    <tr
                      key={
                        demande.id
                      }
                    >

                      <td>

                        <div className="mes-demande-identity">

                          <div className="mes-demande-avatar">
                            📨
                          </div>

                          <div>

                            <strong>
                              {demande.objet}
                            </strong>

                            <span>
                              Demande #
                              {demande.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>
                        {getEntrepriseName(
                          demande
                        )}
                      </td>


                      <td>
                        {getStageName(
                          demande
                        )}
                      </td>


                      <td>

                        <span className="mes-demande-type">
                          {getTypeLabel(
                            demande.type_demande
                          )}
                        </span>

                      </td>


                      <td>

                        <span
                          className={getStatutClass(
                            demande.statut
                          )}
                        >

                          <span>
                            {getStatutIcon(
                              demande.statut
                            )}
                          </span>

                          {getStatutLabel(
                            demande.statut
                          )}

                        </span>

                      </td>


                      <td>
                        {formatDate(
                          demande.date_demande
                        )}
                      </td>


                      <td>

                        <button
                          className="mes-demande-view-button"
                          onClick={() =>
                            setSelectedDemande(
                              demande
                            )
                          }
                        >
                          Voir
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =========================
          MODAL DÉTAIL
      ========================= */}

      {selectedDemande && (

        <div className="mes-demandes-modal-overlay">

          <div className="mes-demandes-modal">

            <div className="mes-demandes-modal-header">

              <div>

                <span>
                  DEMANDE #{selectedDemande.id}
                </span>

                <h2>
                  {selectedDemande.objet}
                </h2>

              </div>

              <button
                className="mes-demandes-modal-close"
                onClick={() =>
                  setSelectedDemande(null)
                }
              >
                ×
              </button>

            </div>


            <div className="mes-demandes-detail">

              <div className="mes-detail-item">

                <span>
                  Type
                </span>

                <strong>
                  {getTypeLabel(
                    selectedDemande.type_demande
                  )}
                </strong>

              </div>


              <div className="mes-detail-item">

                <span>
                  Statut
                </span>

                <strong>

                  <span
                    className={getStatutClass(
                      selectedDemande.statut
                    )}
                  >
                    <span>
                      {getStatutIcon(
                        selectedDemande.statut
                      )}
                    </span>

                    {getStatutLabel(
                      selectedDemande.statut
                    )}
                  </span>

                </strong>

              </div>


              <div className="mes-detail-item">

                <span>
                  Entreprise
                </span>

                <strong>
                  {getEntrepriseName(
                    selectedDemande
                  )}
                </strong>

              </div>


              <div className="mes-detail-item">

                <span>
                  Stage
                </span>

                <strong>
                  {getStageName(
                    selectedDemande
                  )}
                </strong>

              </div>


              <div className="mes-detail-item">

                <span>
                  Date de dépôt
                </span>

                <strong>
                  {formatDate(
                    selectedDemande.date_demande
                  )}
                </strong>

              </div>


              <div className="mes-detail-description">

                <span>
                  Description
                </span>

                <p>
                  {
                    selectedDemande.description ||
                    "Aucune description."
                  }
                </p>

              </div>


              {selectedDemande.commentaire_admin && (

                <div className="mes-detail-description">

                  <span>
                    Commentaire de l'administration
                  </span>

                  <p>
                    {
                      selectedDemande.commentaire_admin
                    }
                  </p>

                </div>

              )}

            </div>


            <div className="mes-demandes-modal-footer">

              <button
                className="mes-demandes-modal-button"
                onClick={() =>
                  setSelectedDemande(null)
                }
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MesDemandes;