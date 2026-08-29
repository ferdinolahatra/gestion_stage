import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Candidatures.css";

function Candidatures() {

  const [candidatures, setCandidatures] = useState([]);
  const [offres, setOffres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TOUS");

  const [selectedCandidature, setSelectedCandidature] =
    useState(null);

  const [notification, setNotification] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  // =====================================================
  // CHARGEMENT
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        candidaturesResponse,
        offresResponse
      ] = await Promise.all([

        api.get("candidatures/"),

        api.get("stages/"),

      ]);

      const candidaturesData =
        Array.isArray(candidaturesResponse.data)
          ? candidaturesResponse.data
          : candidaturesResponse.data.results || [];

      const offresData =
        Array.isArray(offresResponse.data)
          ? offresResponse.data
          : offresResponse.data.results || [];

      setCandidatures(candidaturesData);
      setOffres(offresData);

    } catch (error) {

      console.error(
        "Erreur candidatures :",
        error
      );

      if (error.response?.status === 401) {

        setError(
          "Votre session a expiré."
        );

      } else if (error.response?.status === 403) {

        setError(
          "Vous n'avez pas accès aux candidatures."
        );

      } else {

        setError(
          "Impossible de charger les candidatures."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const showNotification = (
    title,
    message,
    type = "success"
  ) => {

    setNotification({
      visible: true,
      type,
      title,
      message,
    });

    setTimeout(() => {

      setNotification((previous) => ({
        ...previous,
        visible: false,
      }));

    }, 4000);
  };

  // =====================================================
  // OFFRE
  // =====================================================

  const getOffreTitle = (offreId) => {

    const offre = offres.find(
      (item) =>
        item.id === Number(offreId)
    );

    return (
      offre?.titre ||
      "Offre inconnue"
    );
  };

  // =====================================================
  // STATUT
  // =====================================================

  const getStatusLabel = (status) => {

    switch (status) {

      case "EN_ATTENTE":
        return "En attente";

      case "ACCEPTEE":
        return "Acceptée";

      case "REFUSEE":
        return "Refusée";

      default:
        return status;

    }
  };

  // =====================================================
  // FILTRAGE
  // =====================================================

  const filteredCandidatures = useMemo(() => {

    const value =
      search.trim().toLowerCase();

    return candidatures.filter(
      (candidature) => {

        const statusMatch =
          filterStatus === "TOUS" ||
          candidature.statut ===
            filterStatus;

        if (!statusMatch) {
          return false;
        }

        if (!value) {
          return true;
        }

        const offreTitle =
          candidature.offre_stage_nom ||
          getOffreTitle(
            candidature.offre_stage
          );

        return [

          candidature.etudiant,

          candidature.etudiant_nom,

          candidature.etudiant_prenom,

          candidature.etudiant_nom_famille,

          candidature.etudiant_email,

          candidature.lettre_motivation,

          candidature.statut,

          offreTitle,

        ]
          .filter(Boolean)
          .some((field) =>
            String(field)
              .toLowerCase()
              .includes(value)
          );
      }
    );

  }, [
    candidatures,
    search,
    filterStatus,
    offres,
  ]);

  // =====================================================
  // ACCEPTER
  // =====================================================

  const handleAccept = async (
    candidature
  ) => {

    if (!isAdmin) {
      return;
    }

    try {

      setActionLoading(
        `accept-${candidature.id}`
      );

      const response =
        await api.patch(
          `candidatures/${candidature.id}/accept/`
        );

      setCandidatures(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              candidature.id
                ? {
                    ...item,
                    statut:
                      response.data.statut,
                  }
                : item
          )
      );

      showNotification(
        "Candidature acceptée",
        "La candidature a été acceptée avec succès."
      );

    } catch (error) {

      console.error(
        "Erreur acceptation :",
        error
      );

      showNotification(
        "Erreur",
        "Impossible d'accepter cette candidature.",
        "error"
      );

    } finally {

      setActionLoading(null);

    }
  };

  // =====================================================
  // REFUSER
  // =====================================================

  const handleRefuse = async (
    candidature
  ) => {

    if (!isAdmin) {
      return;
    }

    try {

      setActionLoading(
        `refuse-${candidature.id}`
      );

      const response =
        await api.patch(
          `candidatures/${candidature.id}/refuse/`
        );

      setCandidatures(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              candidature.id
                ? {
                    ...item,
                    statut:
                      response.data.statut,
                  }
                : item
          )
      );

      showNotification(
        "Candidature refusée",
        "La candidature a été refusée."
      );

    } catch (error) {

      console.error(
        "Erreur refus :",
        error
      );

      showNotification(
        "Erreur",
        "Impossible de refuser cette candidature.",
        "error"
      );

    } finally {

      setActionLoading(null);

    }
  };

  // =====================================================
  // DETAILS
  // =====================================================

  const handleOpenDetails = (
    candidature
  ) => {

    setSelectedCandidature(
      candidature
    );
  };

  const handleCloseDetails = () => {

    setSelectedCandidature(null);

  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {

    return (
      <div className="candidatures-state">

        <div className="candidatures-spinner" />

        <p>
          Chargement des candidatures...
        </p>

      </div>
    );
  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (error) {

    return (
      <div className="candidatures-state candidatures-error">

        <h2>
          Accès impossible
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={loadData}
        >
          Réessayer
        </button>

      </div>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (

    <div className="candidatures-page">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.visible && (

        <div
          className={`candidatures-toast candidatures-toast-${notification.type}`}
        >

          <div className="candidatures-toast-icon">

            {notification.type ===
            "error"
              ? "!"
              : "✓"}

          </div>

          <div>

            <strong>
              {notification.title}
            </strong>

            <p>
              {notification.message}
            </p>

          </div>

          <button
            onClick={() =>
              setNotification(
                (previous) => ({
                  ...previous,
                  visible: false,
                })
              )
            }
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="candidatures-header">

        <div>

          <div className="candidatures-breadcrumb">

            Administration

            <span>/</span>

            Candidatures

          </div>

          <span className="candidatures-kicker">
            SUIVI DES CANDIDATURES
          </span>

          <h1>
            Candidatures
          </h1>

          <p>
            Consultez et gérez les candidatures
            déposées pour les offres de stage.
          </p>

        </div>

        <div className="candidatures-summary">

          <strong>
            {filteredCandidatures.length}
          </strong>

          <span>
            candidature(s)
          </span>

        </div>

      </header>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="candidatures-toolbar">

        <div className="candidatures-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher une candidature..."
          />

        </div>

        <div className="candidatures-filters">

          <button
            className={
              filterStatus === "TOUS"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus("TOUS")
            }
          >
            Toutes
          </button>

          <button
            className={
              filterStatus === "EN_ATTENTE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus(
                "EN_ATTENTE"
              )
            }
          >
            En attente
          </button>

          <button
            className={
              filterStatus === "ACCEPTEE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus(
                "ACCEPTEE"
              )
            }
          >
            Acceptées
          </button>

          <button
            className={
              filterStatus === "REFUSEE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus(
                "REFUSEE"
              )
            }
          >
            Refusées
          </button>

        </div>

      </section>

      {/* =================================================
          TABLEAU
      ================================================= */}

      <section className="candidatures-card">

        <div className="candidatures-card-header">

          <div>

            <h2>
              Candidatures reçues
            </h2>

            <p>
              Liste des candidatures enregistrées.
            </p>

          </div>

        </div>

        {filteredCandidatures.length === 0 ? (

          <div className="candidatures-empty">

            <div className="candidatures-empty-icon">
              📝
            </div>

            <h3>
              Aucune candidature
            </h3>

            <p>
              Aucune candidature ne correspond
              aux critères sélectionnés.
            </p>

          </div>

        ) : (

          <div className="candidatures-table-wrapper">

            <table className="candidatures-table">

              <thead>

                <tr>

                  <th>
                    Étudiant
                  </th>

                  <th>
                    Offre
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    CV
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCandidatures.map(
                  (candidature) => (

                    <tr
                      key={
                        candidature.id
                      }
                    >

                      {/* =========================
                          ETUDIANT
                      ========================= */}

                      <td>

                        <div className="candidature-user">

                          <div className="candidature-avatar">

                            {String(
                              candidature.etudiant_nom ||
                              candidature.etudiant ||
                              "E"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>

                              {candidature.etudiant_prenom ||
                              candidature.etudiant_nom_famille
                                ? `${candidature.etudiant_prenom || ""} ${candidature.etudiant_nom_famille || ""}`
                                : `Étudiant #${candidature.etudiant}`}

                            </strong>

                            <span>

                              {candidature.etudiant_email ||
                                `Candidature #${candidature.id}`}

                            </span>

                          </div>

                        </div>

                      </td>

                      {/* =========================
                          OFFRE
                      ========================= */}

                      <td>

                        <strong className="candidature-offer">

                          {candidature.offre_stage_nom ||
                            getOffreTitle(
                              candidature.offre_stage
                            )}

                        </strong>

                      </td>

                      {/* =========================
                          DATE
                      ========================= */}

                      <td>

                        {candidature.date_candidature
                          ? new Date(
                              candidature.date_candidature
                            ).toLocaleDateString(
                              "fr-FR"
                            )
                          : "—"}

                      </td>

                      {/* =========================
                          STATUT
                      ========================= */}

                      <td>

                        <span
                          className={
                            candidature.statut ===
                            "EN_ATTENTE"
                              ? "candidature-status status-pending"
                              : candidature.statut ===
                                "ACCEPTEE"
                              ? "candidature-status status-accepted"
                              : "candidature-status status-refused"
                          }
                        >

                          <span />

                          {getStatusLabel(
                            candidature.statut
                          )}

                        </span>

                      </td>

                      {/* =========================
                          CV
                      ========================= */}

                      <td>

                        {candidature.cv ? (

                          <a
                            href={
                              candidature.cv
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="cv-button"
                          >
                            📎 Voir CV
                          </a>

                        ) : (
                          "—"
                        )}

                      </td>

                      {/* =========================
                          ACTIONS
                      ========================= */}

                      <td>

                        <div className="candidatures-actions">

                          <button
                            className="details-button"
                            onClick={() =>
                              handleOpenDetails(
                                candidature
                              )
                            }
                          >
                            Voir
                          </button>

                          {isAdmin &&
                            candidature.statut ===
                              "EN_ATTENTE" && (

                              <>

                                <button
                                  className="accept-button"
                                  disabled={
                                    actionLoading ===
                                    `accept-${candidature.id}`
                                  }
                                  onClick={() =>
                                    handleAccept(
                                      candidature
                                    )
                                  }
                                >

                                  {actionLoading ===
                                  `accept-${candidature.id}`
                                    ? "..."
                                    : "Accepter"}

                                </button>

                                <button
                                  className="refuse-button"
                                  disabled={
                                    actionLoading ===
                                    `refuse-${candidature.id}`
                                  }
                                  onClick={() =>
                                    handleRefuse(
                                      candidature
                                    )
                                  }
                                >

                                  {actionLoading ===
                                  `refuse-${candidature.id}`
                                    ? "..."
                                    : "Refuser"}

                                </button>

                              </>

                            )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* =================================================
          MODAL DETAILS
      ================================================= */}

      {selectedCandidature && (

        <div className="candidature-modal-overlay">

          <div className="candidature-modal">

            {/* ================================
                HEADER MODAL
            ================================= */}

            <div className="candidature-modal-header">

              <div>

                <span>
                  DOSSIER DE CANDIDATURE
                </span>

                <h2>

                  {selectedCandidature.etudiant_prenom ||
                  selectedCandidature.etudiant_nom_famille
                    ? `${selectedCandidature.etudiant_prenom || ""} ${selectedCandidature.etudiant_nom_famille || ""}`
                    : `Étudiant #${selectedCandidature.etudiant}`}

                </h2>

              </div>

              <button
                onClick={
                  handleCloseDetails
                }
                className="candidature-modal-close"
              >
                ×
              </button>

            </div>

            {/* ================================
                DETAILS
            ================================= */}

            <div className="candidature-details">

              {/* ================================
                  INFORMATIONS ETUDIANT
              ================================= */}

              <div className="detail-section">

                <h3>
                  👤 Informations de l'étudiant
                </h3>

                <div className="detail-grid">

                  <div className="detail-block">

                    <label>
                      Prénom
                    </label>

                    <p>
                      {selectedCandidature.etudiant_prenom ||
                        "Non renseigné"}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Nom
                    </label>

                    <p>
                      {selectedCandidature.etudiant_nom_famille ||
                        "Non renseigné"}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Nom d'utilisateur
                    </label>

                    <p>
                      {selectedCandidature.etudiant_nom ||
                        `Étudiant #${selectedCandidature.etudiant}`}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Email
                    </label>

                    <p>
                      {selectedCandidature.etudiant_email ||
                        "Non renseigné"}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Téléphone
                    </label>

                    <p>
                      {selectedCandidature.etudiant_telephone ||
                        "Non renseigné"}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Date de naissance
                    </label>

                    <p>
                      {selectedCandidature.etudiant_date_naissance
                        ? new Date(
                            selectedCandidature.etudiant_date_naissance
                          ).toLocaleDateString(
                            "fr-FR"
                          )
                        : "Non renseignée"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ================================
                  INFORMATIONS CANDIDATURE
              ================================= */}

              <div className="detail-section">

                <h3>
                  📋 Informations de la candidature
                </h3>

                <div className="detail-grid">

                  <div className="detail-block">

                    <label>
                      Offre de stage
                    </label>

                    <p>
                      {selectedCandidature.offre_stage_nom ||
                        getOffreTitle(
                          selectedCandidature.offre_stage
                        )}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Statut
                    </label>

                    <p>
                      {getStatusLabel(
                        selectedCandidature.statut
                      )}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Date de candidature
                    </label>

                    <p>
                      {selectedCandidature.date_candidature
                        ? new Date(
                            selectedCandidature.date_candidature
                          ).toLocaleString(
                            "fr-FR"
                          )
                        : "—"}
                    </p>

                  </div>

                  <div className="detail-block">

                    <label>
                      Numéro de candidature
                    </label>

                    <p>
                      #{selectedCandidature.id}
                    </p>

                  </div>

                </div>

              </div>

              {/* ================================
                  DEMANDE D'ORIGINE
              ================================= */}

              {selectedCandidature.demande_id && (

                <div className="detail-section">

                  <h3>
                    📄 Demande d'origine
                  </h3>

                  <div className="detail-grid">

                    <div className="detail-block">

                      <label>
                        Numéro de demande
                      </label>

                      <p>
                        #{selectedCandidature.demande_id}
                      </p>

                    </div>

                    <div className="detail-block">

                      <label>
                        Type
                      </label>

                      <p>
                        {selectedCandidature.demande_type ||
                          "Demande de stage"}
                      </p>

                    </div>

                    <div className="detail-block detail-full">

                      <label>
                        Objet
                      </label>

                      <p>
                        {selectedCandidature.demande_objet ||
                          "Non renseigné"}
                      </p>

                    </div>

                    <div className="detail-block detail-full">

                      <label>
                        Description
                      </label>

                      <div className="motivation-box">

                        {selectedCandidature.demande_description ||
                          "Aucune description."}

                      </div>

                    </div>

                  </div>

                </div>

              )}

              {/* ================================
                  LETTRE DE MOTIVATION
              ================================= */}

              <div className="detail-section">

                <h3>
                  ✉️ Lettre de motivation
                </h3>

                <div className="detail-block detail-full">

                  <div className="motivation-box">

                    {selectedCandidature.lettre_motivation ||
                      "Aucune lettre de motivation."}

                  </div>

                </div>

              </div>

              {/* ================================
                  DOCUMENTS
              ================================= */}

              <div className="detail-section">

                <h3>
                  📎 Documents
                </h3>

                <div className="documents-actions">

                  {selectedCandidature.cv && (

                    <a
                      href={
                        selectedCandidature.cv
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="modal-cv-button"
                    >
                      📄 Ouvrir le CV
                    </a>

                  )}

                  {selectedCandidature.lettre_motivation_fichier && (

                    <a
                      href={
                        selectedCandidature.lettre_motivation_fichier
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="modal-cv-button"
                    >
                      📄 Lettre de motivation
                    </a>

                  )}

                  {!selectedCandidature.cv &&
                    !selectedCandidature.lettre_motivation_fichier && (

                      <p>
                        Aucun document disponible.
                      </p>

                    )}

                </div>

              </div>

            </div>

            {/* ================================
                FOOTER
            ================================= */}

            <div className="candidature-modal-footer">

              <button
                onClick={
                  handleCloseDetails
                }
                className="modal-close-button"
              >
                Fermer
              </button>

              {isAdmin &&
                selectedCandidature.statut ===
                  "EN_ATTENTE" && (

                  <>

                    <button
                      className="accept-button"
                      disabled={
                        actionLoading !== null
                      }
                      onClick={async () => {

                        await handleAccept(
                          selectedCandidature
                        );

                        setSelectedCandidature(
                          null
                        );

                      }}
                    >
                      Accepter
                    </button>

                    <button
                      className="refuse-button"
                      disabled={
                        actionLoading !== null
                      }
                      onClick={async () => {

                        await handleRefuse(
                          selectedCandidature
                        );

                        setSelectedCandidature(
                          null
                        );

                      }}
                    >
                      Refuser
                    </button>

                  </>

                )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Candidatures;