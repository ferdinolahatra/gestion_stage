import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AccessDenied from "../components/AccessDenied";
import "./Entreprises.css";

const EMPTY_FORM = {
  nom: "",
  secteur: "",
  adresse: "",
  email: "",
  telephone: "",
  site_web: "",
  responsable: "",
};

function Entreprises() {
  const [entreprises, setEntreprises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEntreprise, setEditingEntreprise] =
    useState(null);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [notification, setNotification] =
    useState({
      visible: false,
      type: "",
      title: "",
      message: "",
    });

  useEffect(() => {
    loadEntreprises();
  }, []);

  const loadEntreprises = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "entreprises/"
      );

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data.results || [];

      setEntreprises(data);
    } catch (error) {
      console.error(
        "Erreur entreprises :",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Votre session a expiré."
        );
      } else if (error.response?.status === 403) {
        setError(
          "Vous n'avez pas accès à la gestion des entreprises."
        );
      } else {
        setError(
          "Impossible de charger les entreprises."
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

  const filteredEntreprises = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return entreprises;
    }

    return entreprises.filter(
      (entreprise) =>
        [
          entreprise.nom,
          entreprise.secteur,
          entreprise.email,
          entreprise.telephone,
          entreprise.responsable,
          entreprise.adresse,
        ]
          .filter(Boolean)
          .some((field) =>
            String(field)
              .toLowerCase()
              .includes(value)
          )
    );
  }, [entreprises, search]);

  const openAddModal = () => {
    setEditingEntreprise(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (
    entreprise
  ) => {
    setEditingEntreprise(entreprise);

    setFormData({
      nom: entreprise.nom || "",
      secteur:
        entreprise.secteur || "",
      adresse:
        entreprise.adresse || "",
      email:
        entreprise.email || "",
      telephone:
        entreprise.telephone || "",
      site_web:
        entreprise.site_web || "",
      responsable:
        entreprise.responsable || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingEntreprise(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "telephone") {
      setFormData((previous) => ({
        ...previous,
        telephone: value
          .replace(/\D/g, "")
          .slice(0, 10),
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

    setSaving(true);

    try {
      if (editingEntreprise) {
        const response =
          await api.put(
            `entreprises/${editingEntreprise.id}/`,
            formData
          );

        setEntreprises(
          (previous) =>
            previous.map(
              (entreprise) =>
                entreprise.id ===
                editingEntreprise.id
                  ? response.data
                  : entreprise
            )
        );

        showNotification(
          "Entreprise modifiée",
          `${formData.nom} a été modifiée avec succès.`
        );
      } else {
        const response =
          await api.post(
            "entreprises/",
            formData
          );

        setEntreprises(
          (previous) => [
            response.data,
            ...previous,
          ]
        );

        showNotification(
          "Nouvelle entreprise",
          `${formData.nom} a été ajoutée avec succès.`
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Erreur entreprise :",
        error
      );

      let message =
        "Impossible d'enregistrer l'entreprise.";

      if (error.response?.data) {
        const data =
          error.response.data;

        if (
          typeof data === "object"
        ) {
          message =
            Object.entries(data)
              .map(
                ([field, value]) => {
                  const text =
                    Array.isArray(
                      value
                    )
                      ? value.join(" ")
                      : String(value);

                  return `${field} : ${text}`;
                }
              )
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

  const handleDelete = async (
    entreprise
  ) => {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer "${entreprise.nom}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        entreprise.id
      );

      await api.delete(
        `entreprises/${entreprise.id}/`
      );

      setEntreprises(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              entreprise.id
          )
      );

      showNotification(
        "Entreprise supprimée",
        `${entreprise.nom} a été supprimée avec succès.`
      );
    } catch (error) {
      console.error(
        "Erreur suppression entreprise :",
        error
      );

      showNotification(
        "Erreur",
        "Impossible de supprimer cette entreprise.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="entreprises-page-state">

        <div className="entreprises-spinner" />

        <p>
          Chargement des entreprises...
        </p>

      </div>
    );
  }

  /*
   * ACCÈS REFUSÉ
   *
   * On garde un affichage moderne
   * pour l'erreur 403.
   */

  if (
    error ===
    "Vous n'avez pas accès à la gestion des entreprises."
  ) {
    return (
      <AccessDenied
        title="Accès refusé"
        message="Vous n'avez pas l'autorisation d'accéder à la gestion des entreprises."
      />
    );
  }

  /*
   * AUTRES ERREURS
   */

  if (error) {
    return (
      <div className="entreprises-page-state entreprises-error">

        <div className="entreprises-error-icon">
          !
        </div>

        <h2>
          Impossible de charger les entreprises
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={
            loadEntreprises
          }
        >
          Réessayer
        </button>

      </div>
    );
  }

  return (
    <div className="entreprises-page">

      {/* =========================
          NOTIFICATION
      ========================= */}

      {notification.visible && (
        <div
          className={`entreprises-toast entreprises-toast-${notification.type}`}
        >

          <div className="entreprises-toast-icon">
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

      {/* =========================
          HEADER
      ========================= */}

      <header className="entreprises-header">

        <div>

          <div className="entreprises-breadcrumb">

            Administration

            <span>
              /
            </span>

            Entreprises

          </div>

          <span className="entreprises-kicker">
            GESTION DES PARTENAIRES
          </span>

          <h1>
            Entreprises
          </h1>

          <p>
            Gérez les entreprises partenaires
            de la plateforme de stages.
          </p>

        </div>

        <button
          className="entreprises-add-button"
          onClick={
            openAddModal
          }
        >

          <span>
            ＋
          </span>

          Ajouter une entreprise

        </button>

      </header>

      {/* =========================
          RECHERCHE
      ========================= */}

      <section className="entreprises-toolbar">

        <div className="entreprises-search">

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
            placeholder="Rechercher une entreprise..."
          />

        </div>

        <div className="entreprises-count">

          <strong>
            {
              filteredEntreprises.length
            }
          </strong>

          <span>
            entreprise(s)
          </span>

        </div>

      </section>

      {/* =========================
          LISTE
      ========================= */}

      <section className="entreprises-card">

        <div className="entreprises-card-header">

          <div>

            <h2>
              Entreprises partenaires
            </h2>

            <p>
              Liste des entreprises enregistrées.
            </p>

          </div>

        </div>

        {filteredEntreprises.length ===
        0 ? (

          <div className="entreprises-empty">

            <div className="entreprises-empty-icon">
              🏢
            </div>

            <h3>
              Aucune entreprise trouvée
            </h3>

            <p>
              Ajoutez votre première
              entreprise partenaire.
            </p>

          </div>

        ) : (

          <div className="entreprises-table-wrapper">

            <table className="entreprises-table">

              <thead>

                <tr>

                  <th>
                    Entreprise
                  </th>

                  <th>
                    Secteur
                  </th>

                  <th>
                    Responsable
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Site web
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredEntreprises.map(
                  (entreprise) => (

                    <tr
                      key={
                        entreprise.id
                      }
                    >

                      <td>

                        <div className="entreprise-identity">

                          <div className="entreprise-avatar">

                            {(
                              entreprise
                                .nom?.[0] ||
                              "E"
                            ).toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {
                                entreprise.nom
                              }
                            </strong>

                            <span>
                              #
                              {
                                entreprise.id
                              }
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="secteur-badge">
                          {
                            entreprise.secteur
                          }
                        </span>

                      </td>

                      <td>
                        {
                          entreprise.responsable
                        }
                      </td>

                      <td>

                        <div className="entreprise-contact">

                          <span>
                            {
                              entreprise.email
                            }
                          </span>

                          <small>
                            {
                              entreprise.telephone
                            }
                          </small>

                        </div>

                      </td>

                      <td>

                        {entreprise.site_web ? (

                          <a
                            href={
                              entreprise.site_web
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="site-link"
                          >
                            Visiter
                          </a>

                        ) : (
                          "—"
                        )}

                      </td>

                      <td>

                        <div className="entreprises-actions">

                          <button
                            className="entreprise-edit"
                            onClick={() =>
                              openEditModal(
                                entreprise
                              )
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="entreprise-delete"
                            disabled={
                              deletingId ===
                              entreprise.id
                            }
                            onClick={() =>
                              handleDelete(
                                entreprise
                              )
                            }
                          >
                            {deletingId ===
                            entreprise.id
                              ? "..."
                              : "Supprimer"}
                          </button>

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

      {/* =========================
          MODAL
      ========================= */}

      {showModal && (

        <div className="entreprises-modal-overlay">

          <div className="entreprises-modal">

            <div className="entreprises-modal-header">

              <div>

                <span>
                  {editingEntreprise
                    ? "MODIFICATION"
                    : "NOUVELLE ENTREPRISE"}
                </span>

                <h2>

                  {editingEntreprise
                    ? "Modifier l'entreprise"
                    : "Ajouter une entreprise"}

                </h2>

              </div>

              <button
                className="entreprise-modal-close"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="entreprises-form-grid">

                <div className="entreprise-field">

                  <label>
                    Nom de l'entreprise
                  </label>

                  <input
                    type="text"
                    name="nom"
                    value={
                      formData.nom
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="entreprise-field">

                  <label>
                    Secteur
                  </label>

                  <input
                    type="text"
                    name="secteur"
                    value={
                      formData.secteur
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="entreprise-field">

                  <label>
                    Responsable
                  </label>

                  <input
                    type="text"
                    name="responsable"
                    value={
                      formData.responsable
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="entreprise-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="entreprise-field">

                  <label>
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    name="telephone"
                    value={
                      formData.telephone
                    }
                    onChange={
                      handleChange
                    }
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0341234567"
                    required
                  />

                </div>

                <div className="entreprise-field">

                  <label>
                    Site web
                  </label>

                  <input
                    type="url"
                    name="site_web"
                    value={
                      formData.site_web
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="https://..."
                  />

                </div>

                <div className="entreprise-field entreprise-field-full">

                  <label>
                    Adresse
                  </label>

                  <textarea
                    name="adresse"
                    value={
                      formData.adresse
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    required
                  />

                </div>

              </div>

              <div className="entreprises-modal-actions">

                <button
                  type="button"
                  className="entreprise-cancel"
                  onClick={
                    closeModal
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="entreprise-save"
                  disabled={saving}
                >

                  {saving
                    ? "Enregistrement..."
                    : editingEntreprise
                    ? "Enregistrer les modifications"
                    : "Créer l'entreprise"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Entreprises;