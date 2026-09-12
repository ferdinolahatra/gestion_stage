import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import AccessDenied from "../components/AccessDenied";

import "./Encadrements.css";

const EMPTY_FORM = {
  enseignant: "",
  etudiant: "",
  stage: "",
  commentaire: "",
};

function Encadrements() {
  const [encadrements, setEncadrements] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [stages, setStages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEncadrement, setEditingEncadrement] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [notification, setNotification] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const userRole = (user?.role?.name || user?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "ADMINISTRATEUR";
  const isEnseignant = userRole === "ENSEIGNANT" || userRole === "TEACHER";

  /* =========================================
      CHARGEMENT DES DONNÉES
  ========================================= */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = [
        api.get("encadrements/"),
        api.get("stages/"),
        api.get("users/"),
      ];

      const responses = await Promise.all(requests);

      const encadrementsData = Array.isArray(responses[0].data)
        ? responses[0].data
        : responses[0].data.results || [];

      const stagesData = Array.isArray(responses[1].data)
        ? responses[1].data
        : responses[1].data.results || [];

      const usersData = Array.isArray(responses[2].data)
        ? responses[2].data
        : responses[2].data.results || [];

      setEncadrements(encadrementsData);
      setStages(stagesData);

      // Filtrage flexible selon la structure du rôle dans le backend
      const teachersList = usersData.filter((item) => {
        const role = String(item.role?.name || item.role || "").toUpperCase();
        return role === "ENSEIGNANT" || role === "TEACHER";
      });

      const studentsList = usersData.filter((item) => {
        const role = String(item.role?.name || item.role || "").toUpperCase();
        return role === "ETUDIANT" || role === "STUDENT" || !role;
      });

      setEnseignants(teachersList);
      setEtudiants(studentsList.length > 0 ? studentsList : usersData);
    } catch (error) {
      console.error("Erreur encadrements :", error);

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError("Vous n'avez pas accès aux encadrements.");
      } else {
        setError("Impossible de charger les encadrements.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
      NOTIFICATION
  ========================================= */

  const showNotification = (title, message, type = "success") => {
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
      NOM UTILISATEUR RÉEL
  ========================================= */

  const getUserName = (id) => {
    if (id === null || id === undefined) return "Non attribué";

    const numericId = Number(id);

    // Chercher dans l'objet complet si le backend a directement renvoyé un objet user
    if (typeof id === "object") {
      const name = `${id.first_name || ""} ${id.last_name || ""}`.trim();
      return name || id.username || id.email || `Utilisateur #${id.id}`;
    }

    const teacher = enseignants.find((item) => item.id === numericId);
    if (teacher) {
      const name = `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();
      return name || teacher.username || teacher.email;
    }

    const student = etudiants.find((item) => item.id === numericId);
    if (student) {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.trim();
      return name || student.username || student.email;
    }

    return `Utilisateur #${id}`;
  };

  /* =========================================
      TITRE DU STAGE
  ========================================= */

  const getStageTitle = (id) => {
    if (typeof id === "object") {
      return id?.titre || id?.title || `Stage #${id?.id}`;
    }
    const stage = stages.find((item) => item.id === Number(id));
    return stage?.titre || stage?.title || `Stage #${id}`;
  };

  /* =========================================
      RECHERCHE
  ========================================= */

  const filteredEncadrements = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return encadrements;
    }

    return encadrements.filter((encadrement) => {
      const enseignantName = getUserName(encadrement.enseignant);
      const etudiantName = getUserName(encadrement.etudiant);
      const stageTitle = getStageTitle(encadrement.stage);

      return [
        enseignantName,
        etudiantName,
        stageTitle,
        encadrement.commentaire,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(value)
        );
    });
  }, [encadrements, enseignants, etudiants, stages, search]);

  /* =========================================
      OUVRIR AFFECTATION
  ========================================= */

  const openAssignmentModal = () => {
    setEditingEncadrement(null);

    setFormData({
      enseignant: isEnseignant
        ? String(user?.id || "")
        : enseignants.length > 0
        ? String(enseignants[0].id)
        : "",
      etudiant: etudiants.length > 0 ? String(etudiants[0].id) : "",
      stage: stages.length > 0 ? String(stages[0].id) : "",
      commentaire: "",
    });

    setShowModal(true);
  };

  /* =========================================
      MODIFIER
  ========================================= */

  const openEditModal = (encadrement) => {
    setEditingEncadrement(encadrement);

    const enseignantId = typeof encadrement.enseignant === "object" ? encadrement.enseignant.id : encadrement.enseignant;
    const etudiantId = typeof encadrement.etudiant === "object" ? encadrement.etudiant.id : encadrement.etudiant;
    const stageId = typeof encadrement.stage === "object" ? encadrement.stage.id : encadrement.stage;

    setFormData({
      enseignant: String(enseignantId || ""),
      etudiant: String(etudiantId || ""),
      stage: String(stageId || ""),
      commentaire: encadrement.commentaire || "",
    });

    setShowModal(true);
  };

  /* =========================================
      FERMER
  ========================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingEncadrement(null);
    setFormData(EMPTY_FORM);
  };

  /* =========================================
      CHANGEMENT FORMULAIRE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
      AFFECTATION / MODIFICATION
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.enseignant ||
      !formData.etudiant ||
      !formData.stage
    ) {
      showNotification(
        "Affectation incomplète",
        "Veuillez sélectionner l'enseignant, l'étudiant et le stage.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        enseignant: Number(formData.enseignant),
        etudiant: Number(formData.etudiant),
        stage: Number(formData.stage),
        commentaire: formData.commentaire,
      };

      if (editingEncadrement) {
        const response = await api.put(
          `encadrements/${editingEncadrement.id}/`,
          payload
        );

        setEncadrements((previous) =>
          previous.map((item) =>
            item.id === editingEncadrement.id ? response.data : item
          )
        );

        showNotification(
          "Affectation modifiée",
          "L'affectation de l'encadreur a été modifiée avec succès."
        );
      } else {
        const response = await api.post("encadrements/", payload);

        setEncadrements((previous) => [response.data, ...previous]);

        showNotification(
          "Affectation réussie",
          "L'encadreur a été affecté à l'étudiant et au stage avec succès."
        );
      }

      closeModal();
    } catch (error) {
      console.error("Erreur affectation :", error);

      let message = "Impossible d'effectuer l'affectation.";

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

      showNotification("Erreur d'affectation", message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
      SUPPRESSION
  ========================================= */

  const handleDelete = async (encadrement) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette affectation d'encadrement ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(encadrement.id);

      await api.delete(`encadrements/${encadrement.id}/`);

      setEncadrements((previous) =>
        previous.filter((item) => item.id !== encadrement.id)
      );

      showNotification(
        "Affectation supprimée",
        "L'affectation de l'encadreur a été supprimée avec succès."
      );
    } catch (error) {
      console.error("Erreur suppression :", error);

      showNotification(
        "Erreur",
        "Impossible de supprimer cette affectation.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================
      CHARGEMENT
  ========================================= */

  if (loading) {
    return (
      <div className="encadrements-state">
        <div className="encadrements-spinner" />
        <p>Chargement des encadrements...</p>
      </div>
    );
  }

  /* =========================================
      ACCÈS REFUSÉ
  ========================================= */

  if (error === "Vous n'avez pas accès aux encadrements.") {
    return (
      <AccessDenied
        title="Accès refusé"
        message="Vous n'avez pas l'autorisation d'accéder à la gestion des encadrements."
        module="Gestion des encadrements"
        icon="👨‍🏫"
      />
    );
  }

  /* =========================================
      AUTRE ERREUR
  ========================================= */

  if (error) {
    return (
      <div className="encadrements-state encadrements-error">
        <div className="encadrements-error-icon">!</div>
        <h2>Impossible de charger les encadrements</h2>
        <p>{error}</p>
        <button onClick={loadData}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="encadrements-page">
      {/* =====================================
          NOTIFICATION
      ===================================== */}
      {notification.visible && (
        <div
          className={`encadrements-toast encadrements-toast-${notification.type}`}
        >
          <div className="encadrements-toast-icon">
            {notification.type === "error" ? "!" : "✓"}
          </div>

          <div>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
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

      {/* =====================================
          HEADER
      ===================================== */}
      <header className="encadrements-header">
        <div>
          <div className="encadrements-breadcrumb">
            Administration <span>/</span> Encadrements
          </div>

          <span className="encadrements-kicker">SUIVI PÉDAGOGIQUE</span>

          <h1>Encadrements</h1>

          <p>Organisez le suivi des étudiants pendant leur stage.</p>
        </div>

        {(isAdmin || isEnseignant) && (
          <button
            className="encadrements-add-button"
            onClick={openAssignmentModal}
          >
            <span>＋</span> Affectation d'encadrement
          </button>
        )}
      </header>

      {/* =====================================
          BARRE DE RECHERCHE
      ===================================== */}
      <section className="encadrements-toolbar">
        <div className="encadrements-search">
          <span>⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un encadrement..."
          />
        </div>

        <div className="encadrements-count">
          <strong>{filteredEncadrements.length}</strong>
          <span>encadrement(s)</span>
        </div>
      </section>

      {/* =====================================
          LISTE
      ===================================== */}
      <section className="encadrements-card">
        <div className="encadrements-card-header">
          <div>
            <h2>Suivi des stages</h2>
            <p>Liste des affectations d'encadrement.</p>
          </div>
        </div>

        {filteredEncadrements.length === 0 ? (
          <div className="encadrements-empty">
            <div className="encadrements-empty-icon">👨‍🏫</div>
            <h3>Aucune affectation</h3>
            <p>Aucun encadrement ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="encadrements-table-wrapper">
            <table className="encadrements-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Étudiant</th>
                  <th>Stage</th>
                  <th>Date d'affectation</th>
                  <th>Commentaire</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEncadrements.map((encadrement) => (
                  <tr key={encadrement.id}>
                    {/* Enseignant */}
                    <td>
                      <div className="encadrement-user">
                        <div className="encadrement-avatar teacher">👨‍🏫</div>
                        <div>
                          <strong>
                            {getUserName(encadrement.enseignant)}
                          </strong>
                          <span>Encadreur</span>
                        </div>
                      </div>
                    </td>

                    {/* Étudiant */}
                    <td>
                      <div className="encadrement-user">
                        <div className="encadrement-avatar student">🎓</div>
                        <div>
                          <strong>
                            {getUserName(encadrement.etudiant)}
                          </strong>
                          <span>Étudiant</span>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td>
                      <strong className="encadrement-stage">
                        {getStageTitle(encadrement.stage)}
                      </strong>
                    </td>

                    {/* Date */}
                    <td>
                      {encadrement.date_affectation
                        ? new Date(
                            encadrement.date_affectation
                          ).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>

                    {/* Commentaire */}
                    <td>
                      <span className="encadrement-comment">
                        {encadrement.commentaire || "Aucun commentaire"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="encadrements-actions">
                        <button
                          className="encadrement-edit"
                          onClick={() => openEditModal(encadrement)}
                        >
                          Modifier
                        </button>

                        <button
                          className="encadrement-delete"
                          disabled={deletingId === encadrement.id}
                          onClick={() => handleDelete(encadrement)}
                        >
                          {deletingId === encadrement.id
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

      {/* =====================================
          MODAL AFFECTATION
      ===================================== */}
      {showModal && (
        <div className="encadrements-modal-overlay">
          <div className="encadrements-modal">
            <div className="encadrements-modal-header">
              <div>
                <span>
                  {editingEncadrement
                    ? "MODIFICATION"
                    : "AFFECTATION D'ENCADREUR"}
                </span>

                <h2>
                  {editingEncadrement
                    ? "Modifier l'affectation"
                    : "Affectation d'encadreur"}
                </h2>

                <p className="encadrement-modal-description">
                  Affectez un enseignant au suivi d'un étudiant dans le cadre de son stage.
                </p>
              </div>

              <button
                className="encadrement-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="encadrements-form-grid">
                {/* Enseignant */}
                <div className="encadrement-field">
                  <label>Encadreur / Enseignant</label>

                  {isAdmin ? (
                    <select
                      name="enseignant"
                      value={formData.enseignant}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner un enseignant</option>
                      {enseignants.map((enseignant) => (
                        <option key={enseignant.id} value={enseignant.id}>
                          {getUserName(enseignant)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={getUserName(user)}
                      disabled
                    />
                  )}
                </div>

                {/* Étudiant */}
                <div className="encadrement-field">
                  <label>Nom étudiant inscrit sur le compte</label>

                  <select
                    name="etudiant"
                    value={formData.etudiant}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map((etudiant) => (
                      <option key={etudiant.id} value={etudiant.id}>
                        {getUserName(etudiant)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stage */}
                <div className="encadrement-field encadrement-field-full">
                  <label>Stage concerné</label>

                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner une offre de stage</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.titre || stage.title || `Stage #${stage.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commentaire */}
                <div className="encadrement-field encadrement-field-full">
                  <label>Commentaire (optionnel)</label>
                  <textarea
                    name="commentaire"
                    rows="3"
                    value={formData.commentaire}
                    onChange={handleChange}
                    placeholder="Instructions ou détails sur cet encadrement..."
                  />
                </div>
              </div>

              <div className="encadrements-modal-actions">
                <button
                  type="button"
                  className="encadrement-button-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="encadrement-button-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingEncadrement
                    ? "Mettre à jour"
                    : "Affecter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Encadrements;