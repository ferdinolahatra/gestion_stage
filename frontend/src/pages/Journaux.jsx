import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Journaux.css";

const EMPTY_FORM = {
  stage: "",
  date: "",
  activite: "",
  difficultes: "",
  solutions: "",
  commentaire: "",
};

function Journaux() {
  const [journaux, setJournaux] = useState([]);
  const [stages, setStages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

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

      const [journauxResponse, stagesResponse] =
        await Promise.all([
          api.get("journaux/"),
          api.get("stages/"),
        ]);

      const journauxData = Array.isArray(
        journauxResponse.data
      )
        ? journauxResponse.data
        : journauxResponse.data.results || [];

      const stagesData = Array.isArray(
        stagesResponse.data
      )
        ? stagesResponse.data
        : stagesResponse.data.results || [];

      setJournaux(journauxData);
      setStages(stagesData);
    } catch (error) {
      console.error("Erreur journaux :", error);

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError(
          "Vous n'avez pas accès aux journaux."
        );
      } else {
        setError(
          "Impossible de charger les journaux."
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

  const filteredJournaux = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return journaux;
    }

    return journaux.filter((journal) => {
      const stageTitle = getStageTitle(
        journal.stage
      );

      return [
        stageTitle,
        journal.date,
        journal.activite,
        journal.difficultes,
        journal.solutions,
        journal.commentaire,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [journaux, stages, search]);

  const openAddModal = () => {
    setEditingJournal(null);

    setFormData({
      ...EMPTY_FORM,
      stage:
        stages.length > 0
          ? String(stages[0].id)
          : "",
    });

    setShowModal(true);
  };

  const openEditModal = (journal) => {
    setEditingJournal(journal);

    setFormData({
      stage: String(journal.stage || ""),
      date: journal.date || "",
      activite: journal.activite || "",
      difficultes: journal.difficultes || "",
      solutions: journal.solutions || "",
      commentaire: journal.commentaire || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingJournal(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    setSaving(true);

    try {
      const payload = {
        stage: Number(formData.stage),
        date: formData.date,
        activite: formData.activite,
        difficultes: formData.difficultes,
        solutions: formData.solutions,
        commentaire: formData.commentaire,
      };

      if (editingJournal) {
        const response = await api.put(
          `journaux/${editingJournal.id}/`,
          payload
        );

        setJournaux((previous) =>
          previous.map((journal) =>
            journal.id === editingJournal.id
              ? response.data
              : journal
          )
        );

        showNotification(
          "Journal modifié",
          "L'entrée du journal a été modifiée avec succès."
        );
      } else {
        const response = await api.post(
          "journaux/",
          payload
        );

        setJournaux((previous) => [
          response.data,
          ...previous,
        ]);

        showNotification(
          "Nouvelle entrée",
          "L'entrée du journal a été ajoutée avec succès."
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Erreur journal :",
        error
      );

      let message =
        "Impossible d'enregistrer le journal.";

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

  const handleDelete = async (journal) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette entrée du journal ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(journal.id);

      await api.delete(
        `journaux/${journal.id}/`
      );

      setJournaux((previous) =>
        previous.filter(
          (item) => item.id !== journal.id
        )
      );

      showNotification(
        "Entrée supprimée",
        "L'entrée du journal a été supprimée avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur suppression journal :",
        error
      );

      showNotification(
        "Erreur",
        "Impossible de supprimer cette entrée.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="journaux-state">
        <div className="journaux-spinner" />
        <p>Chargement des journaux...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journaux-state journaux-error">
        <h2>Accès impossible</h2>

        <p>{error}</p>

        <button onClick={loadData}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="journaux-page">

      {notification.visible && (
        <div
          className={`journaux-toast journaux-toast-${notification.type}`}
        >
          <div className="journaux-toast-icon">
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

      <header className="journaux-header">

        <div>
          <div className="journaux-breadcrumb">
            Administration
            <span>/</span>
            Journaux
          </div>

          <span className="journaux-kicker">
            SUIVI QUOTIDIEN
          </span>

          <h1>Journal de stage</h1>

          <p>
            Consultez et gérez les activités réalisées
            pendant les stages.
          </p>
        </div>

        {isEtudiant && (
          <button
            className="journaux-add-button"
            onClick={openAddModal}
          >
            <span>＋</span>
            Ajouter une entrée
          </button>
        )}

        {isAdmin && (
          <div className="journaux-admin-label">
            Administration
          </div>
        )}

      </header>

      <section className="journaux-toolbar">

        <div className="journaux-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher une activité..."
          />
        </div>

        <div className="journaux-count">
          <strong>
            {filteredJournaux.length}
          </strong>

          <span>
            entrée(s)
          </span>
        </div>

      </section>

      <section className="journaux-card">

        <div className="journaux-card-header">

          <div>
            <h2>
              Entrées du journal
            </h2>

            <p>
              Historique des activités de stage.
            </p>
          </div>

        </div>

        {filteredJournaux.length === 0 ? (

          <div className="journaux-empty">

            <div className="journaux-empty-icon">
              📔
            </div>

            <h3>
              Aucun journal
            </h3>

            <p>
              Aucune entrée de journal ne correspond
              à votre recherche.
            </p>

          </div>

        ) : (

          <div className="journaux-table-wrapper">

            <table className="journaux-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Stage</th>
                  <th>Activité</th>
                  <th>Difficultés</th>
                  <th>Solutions</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredJournaux.map((journal) => (

                  <tr key={journal.id}>

                    <td>
                      <span className="journal-date">
                        {journal.date
                          ? new Date(
                              journal.date
                            ).toLocaleDateString(
                              "fr-FR"
                            )
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <strong className="journal-stage">
                        {getStageTitle(
                          journal.stage
                        )}
                      </strong>
                    </td>

                    <td>
                      <div className="journal-content">
                        {journal.activite}
                      </div>
                    </td>

                    <td>
                      <div className="journal-small-content">
                        {journal.difficultes ||
                          "Aucune"}
                      </div>
                    </td>

                    <td>
                      <div className="journal-small-content">
                        {journal.solutions ||
                          "Aucune"}
                      </div>
                    </td>

                    <td>

                      <div className="journaux-actions">

                        <button
                          className="journal-edit"
                          onClick={() =>
                            openEditModal(
                              journal
                            )
                          }
                        >
                          Modifier
                        </button>

                        <button
                          className="journal-delete"
                          disabled={
                            deletingId === journal.id
                          }
                          onClick={() =>
                            handleDelete(
                              journal
                            )
                          }
                        >
                          {deletingId === journal.id
                            ? "..."
                            : "Supprimer"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {showModal && (

        <div className="journaux-modal-overlay">

          <div className="journaux-modal">

            <div className="journaux-modal-header">

              <div>

                <span>
                  {editingJournal
                    ? "MODIFICATION"
                    : "NOUVELLE ENTRÉE"}
                </span>

                <h2>
                  {editingJournal
                    ? "Modifier l'entrée"
                    : "Ajouter une entrée au journal"}
                </h2>

              </div>

              <button
                className="journal-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="journaux-form-grid">

                <div className="journal-field">

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

                <div className="journal-field">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="journal-field journal-field-full">

                  <label>
                    Activité réalisée
                  </label>

                  <textarea
                    name="activite"
                    value={formData.activite}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Décrivez les activités réalisées..."
                    required
                  />

                </div>

                <div className="journal-field">

                  <label>
                    Difficultés rencontrées
                  </label>

                  <textarea
                    name="difficultes"
                    value={
                      formData.difficultes
                    }
                    onChange={handleChange}
                    rows="4"
                    placeholder="Aucune difficulté..."
                  />

                </div>

                <div className="journal-field">

                  <label>
                    Solutions apportées
                  </label>

                  <textarea
                    name="solutions"
                    value={
                      formData.solutions
                    }
                    onChange={handleChange}
                    rows="4"
                    placeholder="Solutions mises en place..."
                  />

                </div>

                <div className="journal-field journal-field-full">

                  <label>
                    Commentaire
                  </label>

                  <textarea
                    name="commentaire"
                    value={
                      formData.commentaire
                    }
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ajouter une remarque..."
                  />

                </div>

              </div>

              <div className="journaux-modal-actions">

                <button
                  type="button"
                  className="journal-cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="journal-save"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingJournal
                    ? "Enregistrer les modifications"
                    : "Ajouter au journal"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Journaux;