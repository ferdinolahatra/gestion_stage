import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  Clock3,
  FileText,
  FileUser,
  User,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Inbox,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Mail,
  ChevronRight,
  ShieldCheck,
  MessageSquareText,
  Paperclip,
  FileCheck2,
} from "lucide-react";

import api from "../services/api";
import AccessDenied from "../components/AccessDenied";

import "./ValidationDemandes.css";

function ValidationDemandes() {
  const [demandes, setDemandes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [filterType, setFilterType] = useState("TOUS");

  const [selectedDemande, setSelectedDemande] = useState(null);

  const [notification, setNotification] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  /* =========================================
     UTILISATEUR CONNECTÉ
  ========================================= */

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  /* =========================================
     CHARGEMENT
  ========================================= */

  useEffect(() => {
    if (isAdmin) {
      loadDemandes();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("demandes/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setDemandes(data);
    } catch (error) {
      console.error(
        "Erreur chargement demandes :",
        error
      );

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError(
          "Vous n'avez pas accès à la validation des demandes."
        );
      } else {
        setError(
          "Impossible de charger les demandes."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     NOTIFICATION
  ========================================= */

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

  /* =========================================
     LABELS
  ========================================= */

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
        return "validation-status status-valid";

      case "REFUSEE":
        return "validation-status status-refused";

      default:
        return "validation-status status-pending";
    }
  };

  const getEtudiantName = (demande) => {
    if (demande.etudiant_username) {
      return demande.etudiant_username;
    }

    if (demande.etudiant_name) {
      return demande.etudiant_name;
    }

    if (demande.etudiant?.username) {
      return demande.etudiant.username;
    }

    return `Étudiant #${demande.etudiant || "—"}`;
  };

  const getEntrepriseName = (demande) => {
    if (demande.entreprise_nom) {
      return demande.entreprise_nom;
    }

    if (demande.entreprise_name) {
      return demande.entreprise_name;
    }

    if (demande.entreprise?.nom) {
      return demande.entreprise.nom;
    }

    if (!demande.entreprise) {
      return "Aucune entreprise";
    }

    return `Entreprise #${demande.entreprise}`;
  };

  const getStageName = (demande) => {
    if (demande.stage_titre) {
      return demande.stage_titre;
    }

    if (demande.stage_name) {
      return demande.stage_name;
    }

    if (demande.stage?.titre) {
      return demande.stage.titre;
    }

    if (demande.stage?.title) {
      return demande.stage.title;
    }

    if (!demande.stage) {
      return "Aucun stage associé";
    }

    return `Stage #${demande.stage}`;
  };

  /* =========================================
     DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================
     FICHIERS
  ========================================= */

  const getFileUrl = (file) => {
    if (!file) {
      return null;
    }

    if (
      typeof file === "object" &&
      file.url
    ) {
      return file.url;
    }

    if (
      typeof file === "object" &&
      file.file
    ) {
      file = file.file;
    }

    if (typeof file !== "string") {
      return null;
    }

    if (
      file.startsWith("http://") ||
      file.startsWith("https://")
    ) {
      return file;
    }

    if (file.startsWith("/")) {
      return `http://127.0.0.1:8000${file}`;
    }

    return `http://127.0.0.1:8000/media/${file}`;
  };

  const getFileName = (file) => {
    if (!file) {
      return "";
    }

    const url = getFileUrl(file);

    if (!url) {
      return "";
    }

    try {
      return decodeURIComponent(
        url.split("/").pop()
      );
    } catch {
      return url.split("/").pop();
    }
  };

  const openFile = (file) => {
    const url = getFileUrl(file);

    if (!url) {
      showNotification(
        "Fichier indisponible",
        "Le fichier n'est pas disponible.",
        "error"
      );

      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadFile = (file) => {
    const url = getFileUrl(file);

    if (!url) {
      showNotification(
        "Fichier indisponible",
        "Le fichier n'est pas disponible.",
        "error"
      );

      return;
    }

    const link = document.createElement("a");

    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = getFileName(file);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =========================================
     RECHERCHE
  ========================================= */

  const filteredDemandes = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return demandes.filter((demande) => {
      const matchesStatut =
        filterStatut === "TOUS" ||
        demande.statut === filterStatut;

      const matchesType =
        filterType === "TOUS" ||
        demande.type_demande === filterType;

      if (
        !matchesStatut ||
        !matchesType
      ) {
        return false;
      }

      if (!value) {
        return true;
      }

      return [
        demande.objet,
        demande.description,
        demande.lettre_motivation_texte,
        getTypeLabel(
          demande.type_demande
        ),
        getEtudiantName(demande),
        getEntrepriseName(demande),
        getStageName(demande),
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
    filterType,
  ]);

  /* =========================================
     STATISTIQUES
  ========================================= */

  const stats = useMemo(() => {
    return {
      total: demandes.length,

      pending: demandes.filter(
        (item) =>
          item.statut === "EN_ATTENTE"
      ).length,

      validated: demandes.filter(
        (item) =>
          item.statut === "VALIDEE"
      ).length,

      refused: demandes.filter(
        (item) =>
          item.statut === "REFUSEE"
      ).length,
    };
  }, [demandes]);

  /* =========================================
     ERREUR API
  ========================================= */

  const getApiErrorMessage = (
    error,
    defaultMessage
  ) => {
    if (!error?.response?.data) {
      return defaultMessage;
    }

    const data = error.response.data;

    if (data.detail) {
      return String(data.detail);
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, value]) => {
          const text = Array.isArray(value)
            ? value.join(" ")
            : String(value);

          return `${field} : ${text}`;
        })
        .join("\n");
    }

    return defaultMessage;
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const handleValidate = async (demande) => {
    const confirmed = window.confirm(
      `Voulez-vous valider la demande « ${demande.objet} » ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(demande.id);

      const response = await api.patch(
        `demandes/${demande.id}/validate/`
      );

      const updatedDemande =
        response.data?.demande ||
        response.data;

      setDemandes((previous) =>
        previous.map((item) =>
          item.id === demande.id
            ? {
                ...item,
                ...(updatedDemande &&
                typeof updatedDemande ===
                  "object"
                  ? updatedDemande
                  : {
                      statut: "VALIDEE",
                    }),
              }
            : item
        )
      );

      setSelectedDemande((previous) =>
        previous &&
        previous.id === demande.id
          ? {
              ...previous,
              ...(updatedDemande &&
              typeof updatedDemande ===
                "object"
                ? updatedDemande
                : {
                    statut: "VALIDEE",
                  }),
            }
          : previous
      );

      showNotification(
        "Demande validée",
        "La demande a été validée avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur validation demande :",
        error
      );

      showNotification(
        "Erreur",
        getApiErrorMessage(
          error,
          "Impossible de valider la demande."
        ),
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================
     REFUS
  ========================================= */

  const handleRefuse = async (demande) => {
    const confirmed = window.confirm(
      `Voulez-vous refuser la demande « ${demande.objet} » ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(demande.id);

      const response = await api.patch(
        `demandes/${demande.id}/refuse/`
      );

      const updatedDemande =
        response.data?.demande ||
        response.data;

      setDemandes((previous) =>
        previous.map((item) =>
          item.id === demande.id
            ? {
                ...item,
                ...(updatedDemande &&
                typeof updatedDemande ===
                  "object"
                  ? updatedDemande
                  : {
                      statut: "REFUSEE",
                    }),
              }
            : item
        )
      );

      setSelectedDemande((previous) =>
        previous &&
        previous.id === demande.id
          ? {
              ...previous,
              ...(updatedDemande &&
              typeof updatedDemande ===
                "object"
                ? updatedDemande
                : {
                    statut: "REFUSEE",
                  }),
            }
          : previous
      );

      showNotification(
        "Demande refusée",
        "La demande a été refusée."
      );
    } catch (error) {
      console.error(
        "Erreur refus demande :",
        error
      );

      showNotification(
        "Erreur",
        getApiErrorMessage(
          error,
          "Impossible de refuser la demande."
        ),
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================
     ACCÈS
  ========================================= */

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Accès refusé"
        message="La validation des demandes est réservée exclusivement aux administrateurs."
        module="Validation des demandes"
        icon={<ShieldCheck size={28} />}
      />
    );
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="validation-demandes-state">
        <div className="validation-demandes-spinner" />

        <h2>Chargement des demandes</h2>

        <p>
          Récupération des demandes étudiantes...
        </p>
      </div>
    );
  }

  /* =========================================
     ERREUR
  ========================================= */

  if (error) {
    return (
      <div className="validation-demandes-state validation-demandes-error">
        <div className="validation-demandes-state-icon">
          <AlertCircle size={25} />
        </div>

        <h2>
          Impossible de charger
        </h2>

        <p>{error}</p>

        <button onClick={loadDemandes}>
          <RefreshCw size={15} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="validation-demandes-page">

      {/* =====================================
          NOTIFICATION
      ===================================== */}

      {notification.visible && (
        <div
          className={`validation-demandes-toast validation-demandes-toast-${notification.type}`}
        >
          <div className="validation-demandes-toast-icon">
            {notification.type === "error" ? (
              <XCircle size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}
          </div>

          <div className="validation-toast-content">
            <strong>
              {notification.title}
            </strong>

            <p>
              {notification.message}
            </p>
          </div>

          <button
            className="validation-toast-close"
            onClick={() =>
              setNotification(
                (previous) => ({
                  ...previous,
                  visible: false,
                })
              )
            }
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="validation-demandes-header">

        <div className="validation-header-left">

          <div className="validation-demandes-breadcrumb">
            <span>Administration</span>
            <ChevronRight size={13} />
            <strong>
              Validation des demandes
            </strong>
          </div>

          <div className="validation-title-row">
            <div className="validation-title-icon">
              <ClipboardList size={24} />
            </div>

            <div>
              <span className="validation-demandes-kicker">
                TRAITEMENT ADMINISTRATIF
              </span>

              <h1>
                Validation des demandes
              </h1>

              <p>
                Consultez, analysez et traitez
                les demandes déposées par les
                étudiants.
              </p>
            </div>
          </div>

        </div>

        <div className="validation-header-badge">
          <ShieldCheck size={16} />
          Administration
        </div>

      </header>

      {/* =====================================
          STATISTIQUES
      ===================================== */}

      <section className="validation-demandes-stats">

        <div className="validation-stat-card total-card">
          <div className="validation-stat-icon total">
            <Inbox size={21} />
          </div>

          <div>
            <span>Total des demandes</span>
            <strong>{stats.total}</strong>
            <small>
              Toutes les demandes
            </small>
          </div>
        </div>

        <div className="validation-stat-card pending-card">
          <div className="validation-stat-icon pending">
            <Clock3 size={21} />
          </div>

          <div>
            <span>En attente</span>
            <strong>{stats.pending}</strong>
            <small>
              À traiter
            </small>
          </div>
        </div>

        <div className="validation-stat-card valid-card">
          <div className="validation-stat-icon valid">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Validées</span>
            <strong>{stats.validated}</strong>
            <small>
              Demandes acceptées
            </small>
          </div>
        </div>

        <div className="validation-stat-card refused-card">
          <div className="validation-stat-icon refused">
            <XCircle size={21} />
          </div>

          <div>
            <span>Refusées</span>
            <strong>{stats.refused}</strong>
            <small>
              Demandes refusées
            </small>
          </div>
        </div>

      </section>

      {/* =====================================
          RECHERCHE / FILTRES
      ===================================== */}

      <section className="validation-demandes-toolbar">

        <div className="validation-demandes-search">

          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher un étudiant, une entreprise, une demande..."
          />

          {search && (
            <button
              type="button"
              className="validation-search-clear"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}

        </div>

        <div className="validation-demandes-filters">

          <select
            value={filterStatut}
            onChange={(e) =>
              setFilterStatut(e.target.value)
            }
          >
            <option value="TOUS">
              Tous les statuts
            </option>

            <option value="EN_ATTENTE">
              En attente
            </option>

            <option value="VALIDEE">
              Validées
            </option>

            <option value="REFUSEE">
              Refusées
            </option>
          </select>

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value)
            }
          >
            <option value="TOUS">
              Tous les types
            </option>

            <option value="STAGE">
              Stage
            </option>

            <option value="CONVENTION">
              Convention
            </option>

            <option value="AUTRE">
              Autre
            </option>
          </select>

          <button
            className="validation-demandes-refresh"
            onClick={loadDemandes}
          >
            <RefreshCw size={15} />
            Actualiser
          </button>

        </div>

      </section>

      {/* =====================================
          TABLE
      ===================================== */}

      <section className="validation-demandes-card">

        <div className="validation-demandes-card-header">

          <div>
            <div className="validation-card-title">
              <FileCheck2 size={18} />

              <h2>
                Demandes à traiter
              </h2>
            </div>

            <p>
              {filteredDemandes.length} demande
              {filteredDemandes.length > 1
                ? "s"
                : ""}{" "}
              affichée
              {filteredDemandes.length > 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="validation-result-count">
            {filteredDemandes.length}
          </div>

        </div>

        {filteredDemandes.length === 0 ? (

          <div className="validation-demandes-empty">

            <div className="validation-demandes-empty-icon">
              <Inbox size={29} />
            </div>

            <h3>
              Aucune demande trouvée
            </h3>

            <p>
              Aucune demande ne correspond
              aux critères sélectionnés.
            </p>

            {(search ||
              filterStatut !== "TOUS" ||
              filterType !== "TOUS") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatut("TOUS");
                  setFilterType("TOUS");
                }}
              >
                Réinitialiser les filtres
              </button>
            )}

          </div>

        ) : (

          <div className="validation-demandes-table-wrapper">

            <table className="validation-demandes-table">

              <thead>
                <tr>
                  <th>Demandeur</th>
                  <th>Demande</th>
                  <th>Entreprise</th>
                  <th>Stage</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredDemandes.map(
                  (demande) => (

                    <tr
                      key={demande.id}
                    >

                      <td>
                        <div className="validation-demande-user">

                          <div className="validation-demande-avatar">
                            <User size={18} />
                          </div>

                          <div>
                            <strong>
                              {
                                getEtudiantName(
                                  demande
                                )
                              }
                            </strong>

                            <span>
                              Demande #
                              {demande.id}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="validation-demande-object">

                          <strong>
                            {demande.objet ||
                              "Demande sans objet"}
                          </strong>

                          <span>
                            {demande.description
                              ? demande.description.slice(
                                  0,
                                  65
                                ) +
                                (demande.description
                                  .length > 65
                                  ? "..."
                                  : "")
                              : "Aucune description"}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="validation-table-company">
                          <Building2 size={14} />
                          {getEntrepriseName(
                            demande
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="validation-table-stage">
                          <BriefcaseBusiness
                            size={14}
                          />
                          {getStageName(
                            demande
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="validation-demande-type">
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
                          <span className="validation-status-dot">
                            {demande.statut ===
                            "VALIDEE" ? (
                              <Check size={11} />
                            ) : demande.statut ===
                              "REFUSEE" ? (
                              <X size={11} />
                            ) : (
                              <Clock3 size={10} />
                            )}
                          </span>

                          {getStatutLabel(
                            demande.statut
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="validation-table-date">
                          <CalendarDays
                            size={14}
                          />
                          {formatDate(
                            demande.date_demande
                          )}
                        </div>
                      </td>

                      <td>

                        <div className="validation-demandes-actions">

                          <button
                            className="validation-view-button"
                            onClick={() =>
                              setSelectedDemande(
                                demande
                              )
                            }
                            title="Voir les détails"
                          >
                            <Eye size={14} />
                            Voir
                          </button>

                          {demande.statut ===
                            "EN_ATTENTE" && (
                            <>
                              <button
                                className="validation-accept-button"
                                disabled={
                                  processingId ===
                                  demande.id
                                }
                                onClick={() =>
                                  handleValidate(
                                    demande
                                  )
                                }
                                title="Valider"
                              >
                                <Check size={14} />

                                {processingId ===
                                demande.id
                                  ? "..."
                                  : "Valider"}
                              </button>

                              <button
                                className="validation-refuse-button"
                                disabled={
                                  processingId ===
                                  demande.id
                                }
                                onClick={() =>
                                  handleRefuse(
                                    demande
                                  )
                                }
                                title="Refuser"
                              >
                                <X size={14} />
                                Refuser
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

      {/* =====================================
          MODAL
      ===================================== */}

      {selectedDemande && (

        <div
          className="validation-demandes-modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedDemande(null);
            }
          }}
        >

          <div className="validation-demandes-modal">

            {/* HEADER */}

            <div className="validation-demandes-modal-header">

              <div className="validation-modal-title">

                <div className="validation-modal-title-icon">
                  <FileCheck2 size={21} />
                </div>

                <div>

                  <span>
                    DEMANDE #
                    {selectedDemande.id}
                  </span>

                  <h2>
                    {selectedDemande.objet ||
                      "Demande sans objet"}
                  </h2>

                </div>

              </div>

              <button
                className="validation-demandes-modal-close"
                onClick={() =>
                  setSelectedDemande(null)
                }
              >
                <X size={19} />
              </button>

            </div>

            {/* INFOS */}

            <div className="validation-demandes-detail">

              <div className="validation-detail-item">
                <span>
                  <User size={13} />
                  Demandeur
                </span>

                <strong>
                  {getEtudiantName(
                    selectedDemande
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <FileText size={13} />
                  Type de demande
                </span>

                <strong>
                  {getTypeLabel(
                    selectedDemande.type_demande
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <Building2 size={13} />
                  Entreprise
                </span>

                <strong>
                  {getEntrepriseName(
                    selectedDemande
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <BriefcaseBusiness size={13} />
                  Stage
                </span>

                <strong>
                  {getStageName(
                    selectedDemande
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <CalendarDays size={13} />
                  Date de dépôt
                </span>

                <strong>
                  {formatDate(
                    selectedDemande.date_demande
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <Clock3 size={13} />
                  Date de traitement
                </span>

                <strong>
                  {formatDate(
                    selectedDemande.date_traitement
                  )}
                </strong>
              </div>

              <div className="validation-detail-item">
                <span>
                  <ShieldCheck size={13} />
                  Statut
                </span>

                <strong>
                  <span
                    className={getStatutClass(
                      selectedDemande.statut
                    )}
                  >
                    <span className="validation-status-dot">
                      {selectedDemande.statut ===
                      "VALIDEE" ? (
                        <Check size={11} />
                      ) : selectedDemande.statut ===
                        "REFUSEE" ? (
                        <X size={11} />
                      ) : (
                        <Clock3 size={10} />
                      )}
                    </span>

                    {getStatutLabel(
                      selectedDemande.statut
                    )}
                  </span>
                </strong>
              </div>

              {/* OBJET */}

              <div className="validation-detail-description">

                <div className="validation-description-header">
                  <div>
                    <FileText size={15} />
                    <span>
                      Objet de la demande
                    </span>
                  </div>
                </div>

                <p>
                  {selectedDemande.objet ||
                    "Aucun objet."}
                </p>

              </div>

              {/* DESCRIPTION */}

              <div className="validation-detail-description">

                <div className="validation-description-header">
                  <div>
                    <MessageSquareText
                      size={15}
                    />
                    <span>
                      Message de l'étudiant
                    </span>
                  </div>
                </div>

                <p>
                  {selectedDemande.description ||
                    "Aucune description."}
                </p>

              </div>

              {/* =================================
                  LETTRE DE MOTIVATION
              ================================= */}

              <div className="validation-detail-document">

                <div className="validation-detail-document-header">

                  <div className="validation-document-heading">

                    <div className="validation-document-icon motivation">
                      <FileText size={20} />
                    </div>

                    <div>
                      <h3>
                        Lettre de motivation
                      </h3>

                      <span>
                        {selectedDemande.lettre_motivation_texte
                          ? "Texte saisi par l'étudiant"
                          : selectedDemande.lettre_motivation_fichier
                            ? "Document envoyé"
                            : "Document non fourni"}
                      </span>
                    </div>

                  </div>

                  <div className="validation-document-badge">
                    {selectedDemande.lettre_motivation_texte
                      ? "TEXTE"
                      : selectedDemande.lettre_motivation_fichier
                        ? "FICHIER"
                        : "VIDE"}
                  </div>

                </div>

                {selectedDemande.lettre_motivation_texte ? (

                  <div className="validation-letter-preview">

                    <div className="validation-letter-paper">

                      <div className="validation-letter-paper-top">
                        <FileText size={17} />
                        <span>
                          Lettre de motivation
                        </span>
                      </div>

                      <div className="validation-letter-paper-content">

                        <p>
                          {
                            selectedDemande.lettre_motivation_texte
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                ) : selectedDemande.lettre_motivation_fichier ? (

                  <div className="validation-file-card">

                    <div className="validation-file-icon">
                      <FileText size={25} />
                    </div>

                    <div className="validation-file-info">

                      <strong>
                        Lettre de motivation
                      </strong>

                      <span>
                        {getFileName(
                          selectedDemande.lettre_motivation_fichier
                        )}
                      </span>

                      <small>
                        Document disponible
                      </small>

                    </div>

                    <div className="validation-file-actions">

                      <button
                        type="button"
                        className="validation-file-button"
                        onClick={() =>
                          openFile(
                            selectedDemande.lettre_motivation_fichier
                          )
                        }
                      >
                        <ExternalLink size={14} />
                        Ouvrir
                      </button>

                      <button
                        type="button"
                        className="validation-file-download"
                        onClick={() =>
                          downloadFile(
                            selectedDemande.lettre_motivation_fichier
                          )
                        }
                      >
                        <Download size={14} />
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="validation-no-document">
                    <FileText size={21} />

                    <span>
                      Aucune lettre de motivation
                      fournie.
                    </span>
                  </div>

                )}

              </div>

              {/* =================================
                  CV
              ================================= */}

              <div className="validation-detail-document">

                <div className="validation-detail-document-header">

                  <div className="validation-document-heading">

                    <div className="validation-document-icon cv">
                      <FileUser size={20} />
                    </div>

                    <div>
                      <h3>
                        Curriculum Vitae
                      </h3>

                      <span>
                        {selectedDemande.cv
                          ? "CV fourni par l'étudiant"
                          : "Aucun CV fourni"}
                      </span>
                    </div>

                  </div>

                  <div className="validation-document-badge cv-badge">
                    {selectedDemande.cv
                      ? "CV"
                      : "VIDE"}
                  </div>

                </div>

                {selectedDemande.cv ? (

                  <div className="validation-file-card validation-cv-card">

                    <div className="validation-file-icon cv-file">
                      <FileUser size={25} />
                    </div>

                    <div className="validation-file-info">

                      <strong>
                        Curriculum Vitae
                      </strong>

                      <span>
                        {getFileName(
                          selectedDemande.cv
                        )}
                      </span>

                      <small>
                        Document disponible
                      </small>

                    </div>

                    <div className="validation-file-actions">

                      <button
                        type="button"
                        className="validation-file-button"
                        onClick={() =>
                          openFile(
                            selectedDemande.cv
                          )
                        }
                      >
                        <ExternalLink size={14} />
                        Ouvrir
                      </button>

                      <button
                        type="button"
                        className="validation-file-download"
                        onClick={() =>
                          downloadFile(
                            selectedDemande.cv
                          )
                        }
                      >
                        <Download size={14} />
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="validation-no-document">
                    <FileUser size={21} />

                    <span>
                      Aucun CV fourni.
                    </span>
                  </div>

                )}

              </div>

              {/* COMMENTAIRE ADMIN */}

              {selectedDemande.commentaire_admin && (

                <div className="validation-detail-description">

                  <div className="validation-description-header">
                    <div>
                      <ShieldCheck size={15} />
                      <span>
                        Commentaire administratif
                      </span>
                    </div>
                  </div>

                  <p>
                    {
                      selectedDemande.commentaire_admin
                    }
                  </p>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="validation-demandes-modal-footer">

              {selectedDemande.statut ===
                "EN_ATTENTE" && (

                <div className="validation-modal-actions">

                  <button
                    className="validation-refuse-button"
                    disabled={
                      processingId ===
                      selectedDemande.id
                    }
                    onClick={() =>
                      handleRefuse(
                        selectedDemande
                      )
                    }
                  >
                    <X size={15} />
                    Refuser
                  </button>

                  <button
                    className="validation-accept-button"
                    disabled={
                      processingId ===
                      selectedDemande.id
                    }
                    onClick={() =>
                      handleValidate(
                        selectedDemande
                      )
                    }
                  >
                    <Check size={15} />
                    Valider la demande
                  </button>

                </div>
              )}

              <button
                className="validation-close-button"
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

export default ValidationDemandes;