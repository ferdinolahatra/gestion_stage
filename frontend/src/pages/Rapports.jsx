import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Rapports.css";

function Rapports() {
  const [rapports, setRapports] = useState([]);
  const [stages, setStages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TOUS");

  const [showModal, setShowModal] = useState(false);
  const [editingRapport, setEditingRapport] = useState(null);

  const [formData, setFormData] = useState({
    stage: "",
    titre: "",
    fichier: null,
    commentaire: "",
  });

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
  const isEtudiant = user?.role === "ETUDIANT";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rapportsResponse, stagesResponse] =
        await Promise.all([
          api.get("rapports/"),
          api.get("stages/"),
        ]);

      const rapportsData = Array.isArray(
        rapportsResponse.data
      )
        ? rapportsResponse.data
        : rapportsResponse.data.results || [];

      const stagesData = Array.isArray(
        stagesResponse.data
      )
        ? stagesResponse.data
        : stagesResponse.data.results || [];

      setRapports(rapportsData);
      setStages(stagesData);
    } catch (error) {
      console.error("Erreur rapports :", error);

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError(
          "Vous n'avez pas accès aux rapports."
        );
      } else {
        setError(
          "Impossible de charger les rapports."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

  const getStageTitle = (stageId) => {
    const stage = stages.find(
      (item) => item.id === Number(stageId)
    );

    return stage?.titre || `Stage #${stageId}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return "En attente";
      case "VALIDE":
        return "Validé";
      case "REFUSE":
        return "Refusé";
      default:
        return status;
    }
  };

  const filteredRapports = useMemo(() => {
    const value = search.trim().toLowerCase();

    return rapports.filter((rapport) => {
      const statusMatch =
        filterStatus === "TOUS" ||
        rapport.statut === filterStatus;

      if (!statusMatch) {
        return false;
      }

      if (!value) {
        return true;
      }

      const stageTitle = getStageTitle(
        rapport.stage
      );

      return [
        rapport.titre,
        rapport.commentaire,
        rapport.statut,
        stageTitle,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [rapports, stages, search, filterStatus]);

  const openAddModal = () => {
    setEditingRapport(null);

    setFormData({
      stage:
        stages.length > 0
          ? String(stages[0].id)
          : "",
      titre: "",
      fichier: null,
      commentaire: "",
    });

    setShowModal(true);
  };

  const openEditModal = (rapport) => {
    setEditingRapport(rapport);

    setFormData({
      stage: String(rapport.stage || ""),
      titre: rapport.titre || "",
      fichier: null,
      commentaire: rapport.commentaire || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingRapport(null);

    setFormData({
      stage: "",
      titre: "",
      fichier: null,
      commentaire: "",
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "fichier") {
      setFormData((previous) => ({
        ...previous,
        fichier: files?.[0] || null,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.stage) {
      showNotification(
        "Stage obligatoire",
        "Veuillez sélectionner une offre de stage.",
        "error"
      );
      return;
    }

    if (!editingRapport && !formData.fichier) {
      showNotification(
        "Fichier obligatoire",
        "Veuillez sélectionner votre rapport.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const payload = new FormData();

      payload.append(
        "stage",
        formData.stage
      );

      payload.append(
        "titre",
        formData.titre
      );

      payload.append(
        "commentaire",
        formData.commentaire || ""
      );

      if (formData.fichier) {
        payload.append(
          "fichier",
          formData.fichier
        );
      }

      if (editingRapport) {
        const response = await api.put(
          `rapports/${editingRapport.id}/`,
          payload,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setRapports((previous) =>
          previous.map((rapport) =>
            rapport.id ===
            editingRapport.id
              ? response.data
              : rapport
          )
        );

        showNotification(
          "Rapport modifié",
          "Le rapport a été modifié avec succès."
        );
      } else {
        const response = await api.post(
          "rapports/",
          payload,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setRapports((previous) => [
          response.data,
          ...previous,
        ]);

        showNotification(
          "Nouveau rapport",
          "Votre rapport a été déposé avec succès."
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Erreur rapport :",
        error
      );

      let message =
        "Impossible d'enregistrer le rapport.";

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "object") {
          message = Object.entries(data)
            .map(([field, value]) => {
              const text = Array.isArray(value)
                ? value.join(" ")
                : String(value);

              return `${field} : ${text}`;
            })
            .join("\n");
        }
      }

      showNotification(
        "Erreur",
        message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rapport) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le rapport « ${rapport.titre} » ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(rapport.id);

      await api.delete(
        `rapports/${rapport.id}/`
      );

      setRapports((previous) =>
        previous.filter(
          (item) => item.id !== rapport.id
        )
      );

      showNotification(
        "Rapport supprimé",
        "Le rapport a été supprimé avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur suppression rapport :",
        error
      );

      showNotification(
        "Erreur",
        "Impossible de supprimer ce rapport.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleValidate = async (rapport) => {
    if (!isAdmin) return;

    try {
      setActionLoading(
        `validate-${rapport.id}`
      );

      const response = await api.patch(
        `rapports/${rapport.id}/validate/`
      );

      setRapports((previous) =>
        previous.map((item) =>
          item.id === rapport.id
            ? {
                ...item,
                statut:
                  response.data.statut,
              }
            : item
        )
      );

      showNotification(
        "Rapport validé",
        "Le rapport a été validé avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur validation rapport :",
        error
      );

      showNotification(
        "Action indisponible",
        "L'API de validation du rapport n'est pas encore configurée.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuse = async (rapport) => {
    if (!isAdmin) return;

    try {
      setActionLoading(
        `refuse-${rapport.id}`
      );

      const response = await api.patch(
        `rapports/${rapport.id}/refuse/`
      );

      setRapports((previous) =>
        previous.map((item) =>
          item.id === rapport.id
            ? {
                ...item,
                statut:
                  response.data.statut,
              }
            : item
        )
      );

      showNotification(
        "Rapport refusé",
        "Le rapport a été refusé."
      );
    } catch (error) {
      console.error(
        "Erreur refus rapport :",
        error
      );

      showNotification(
        "Action indisponible",
        "L'API de refus du rapport n'est pas encore configurée.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="rapports-state">
        <div className="rapports-spinner" />
        <p>Chargement des rapports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rapports-state rapports-error">
        <h2>Accès impossible</h2>
        <p>{error}</p>

        <button onClick={loadData}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="rapports-page">

      {notification.visible && (
        <div
          className={`rapports-toast rapports-toast-${notification.type}`}
        >
          <div className="rapports-toast-icon">
            {notification.type === "error"
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
              setNotification((previous) => ({
                ...previous,
                visible: false,
              }))
            }
          >
            ×
          </button>
        </div>
      )}

      <header className="rapports-header">

        <div>
          <div className="rapports-breadcrumb">
            Administration
            <span>/</span>
            Rapports
          </div>

          <span className="rapports-kicker">
            DOCUMENTS DE STAGE
          </span>

          <h1>
            Rapports de stage
          </h1>

          <p>
            Consultez, déposez et suivez les rapports
            de stage.
          </p>
        </div>

        {isEtudiant && (
          <button
            className="rapports-add-button"
            onClick={openAddModal}
          >
            <span>＋</span>
            Déposer un rapport
          </button>
        )}

      </header>

      <section className="rapports-toolbar">

        <div className="rapports-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher un rapport..."
          />
        </div>

        <div className="rapports-filters">

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
            Tous
          </button>

          <button
            className={
              filterStatus === "EN_ATTENTE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus("EN_ATTENTE")
            }
          >
            En attente
          </button>

          <button
            className={
              filterStatus === "VALIDE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus("VALIDE")
            }
          >
            Validés
          </button>

          <button
            className={
              filterStatus === "REFUSE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterStatus("REFUSE")
            }
          >
            Refusés
          </button>

        </div>

      </section>

      <section className="rapports-card">

        <div className="rapports-card-header">
          <div>
            <h2>
              Rapports enregistrés
            </h2>

            <p>
              Liste des rapports soumis sur la plateforme.
            </p>
          </div>

          <span>
            {filteredRapports.length} rapport(s)
          </span>
        </div>

        {filteredRapports.length === 0 ? (

          <div className="rapports-empty">

            <div className="rapports-empty-icon">
              📄
            </div>

            <h3>
              Aucun rapport trouvé
            </h3>

            <p>
              Aucun rapport ne correspond aux critères.
            </p>

          </div>

        ) : (

          <div className="rapports-table-wrapper">

            <table className="rapports-table">

              <thead>

                <tr>
                  <th>Rapport</th>
                  <th>Stage</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Fichier</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredRapports.map(
                  (rapport) => (

                    <tr key={rapport.id}>

                      <td>

                        <div className="rapport-identity">

                          <div className="rapport-avatar">
                            📄
                          </div>

                          <div>
                            <strong>
                              {rapport.titre}
                            </strong>

                            <span>
                              Rapport #{rapport.id}
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        <strong className="rapport-stage">
                          {getStageTitle(
                            rapport.stage
                          )}
                        </strong>
                      </td>

                      <td>
                        {rapport.date_depot
                          ? new Date(
                              rapport.date_depot
                            ).toLocaleDateString(
                              "fr-FR"
                            )
                          : "—"}
                      </td>

                      <td>

                        <span
                          className={
                            rapport.statut ===
                            "EN_ATTENTE"
                              ? "rapport-status status-pending"
                              : rapport.statut ===
                                "VALIDE"
                              ? "rapport-status status-valid"
                              : "rapport-status status-refused"
                          }
                        >
                          <span />
                          {getStatusLabel(
                            rapport.statut
                          )}
                        </span>

                      </td>

                      <td>

                        {rapport.fichier ? (

                          <a
                            href={rapport.fichier}
                            target="_blank"
                            rel="noreferrer"
                            className="rapport-file-button"
                          >
                            📎 Ouvrir
                          </a>

                        ) : (
                          "—"
                        )}

                      </td>

                      <td>

                        <div className="rapports-actions">

                          {isEtudiant && (
                            <button
                              className="rapport-edit"
                              onClick={() =>
                                openEditModal(
                                  rapport
                                )
                              }
                            >
                              Modifier
                            </button>
                          )}

                          {isAdmin &&
                            rapport.statut ===
                              "EN_ATTENTE" && (
                              <>
                                <button
                                  className="rapport-validate"
                                  disabled={
                                    actionLoading ===
                                    `validate-${rapport.id}`
                                  }
                                  onClick={() =>
                                    handleValidate(
                                      rapport
                                    )
                                  }
                                >
                                  Valider
                                </button>

                                <button
                                  className="rapport-refuse"
                                  disabled={
                                    actionLoading ===
                                    `refuse-${rapport.id}`
                                  }
                                  onClick={() =>
                                    handleRefuse(
                                      rapport
                                    )
                                  }
                                >
                                  Refuser
                                </button>
                              </>
                            )}

                          {isEtudiant && (
                            <button
                              className="rapport-delete"
                              disabled={
                                deletingId ===
                                rapport.id
                              }
                              onClick={() =>
                                handleDelete(
                                  rapport
                                )
                              }
                            >
                              {deletingId ===
                              rapport.id
                                ? "..."
                                : "Supprimer"}
                            </button>
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

      {showModal && (

        <div className="rapports-modal-overlay">

          <div className="rapports-modal">

            <div className="rapports-modal-header">

              <div>
                <span>
                  {editingRapport
                    ? "MODIFICATION"
                    : "NOUVEAU RAPPORT"}
                </span>

                <h2>
                  {editingRapport
                    ? "Modifier le rapport"
                    : "Déposer un rapport"}
                </h2>
              </div>

              <button
                className="rapport-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="rapports-form-grid">

                <div className="rapport-field">

                  <label>
                    Stage
                  </label>

                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Sélectionner un stage
                    </option>

                    {stages.map((stage) => (
                      <option
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.titre}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="rapport-field">

                  <label>
                    Titre du rapport
                  </label>

                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder="Ex. Rapport de stage final"
                    required
                  />

                </div>

                <div className="rapport-field rapport-field-full">

                  <label>
                    Fichier du rapport
                    {editingRapport && (
                      <small>
                        Laisser vide pour conserver le fichier actuel
                      </small>
                    )}
                  </label>

                  <input
                    type="file"
                    name="fichier"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    required={!editingRapport}
                  />

                </div>

                <div className="rapport-field rapport-field-full">

                  <label>
                    Commentaire
                  </label>

                  <textarea
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Ajouter une remarque..."
                  />

                </div>

              </div>

              <div className="rapports-modal-actions">

                <button
                  type="button"
                  className="rapport-cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rapport-save"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingRapport
                    ? "Enregistrer les modifications"
                    : "Déposer le rapport"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Rapports;