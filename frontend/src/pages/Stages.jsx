import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import AccessDenied from "../components/AccessDenied";

import "./Stages.css";

const EMPTY_FORM = {
  titre: "",
  description: "",
  domaine: "",
  competences_requises: "",
  entreprise: "",
  duree: "",
  date_debut: "",
  date_fin: "",
  nombre_places: 1,
  statut: "OUVERT",
};


function Stages() {

  const [stages, setStages] = useState([]);
  const [entreprises, setEntreprises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [notification, setNotification] =
    useState({
      visible: false,
      type: "",
      title: "",
      message: "",
    });


  /* =========================
     UTILISATEUR CONNECTÉ
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin =
    user?.role === "ADMIN";

  const isEntreprise =
    user?.role === "ENTREPRISE";

  const canManageStages =
    isAdmin || isEntreprise;


  /* =========================
     CHARGEMENT
  ========================= */

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        stagesResponse,
        entreprisesResponse,
      ] = await Promise.all([
        api.get("stages/"),
        api.get("entreprises/"),
      ]);


      const stagesData =
        Array.isArray(
          stagesResponse.data
        )
          ? stagesResponse.data
          : stagesResponse.data.results || [];


      const entreprisesData =
        Array.isArray(
          entreprisesResponse.data
        )
          ? entreprisesResponse.data
          : entreprisesResponse.data.results || [];


      setStages(stagesData);
      setEntreprises(entreprisesData);

    } catch (error) {

      console.error(
        "Erreur offres :",
        error
      );


      if (
        error.response?.status === 401
      ) {

        setError(
          "Votre session a expiré."
        );

      } else if (
        error.response?.status === 403
      ) {

        setError(
          "Vous n'avez pas accès à cette section."
        );

      } else {

        setError(
          "Impossible de charger les offres de stage."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  /* =========================
     NOTIFICATION
  ========================= */

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

      setNotification(
        (previous) => ({
          ...previous,
          visible: false,
        })
      );

    }, 4500);

  };


  /* =========================
     RECHERCHE
  ========================= */

  const filteredStages = useMemo(() => {

    const value =
      search.trim().toLowerCase();


    if (!value) {
      return stages;
    }


    return stages.filter(
      (stage) => {

        const entreprise =
          entreprises.find(
            (item) =>
              item.id ===
              Number(stage.entreprise)
          );


        return [
          stage.titre,
          stage.domaine,
          stage.description,
          stage.competences_requises,
          stage.duree,
          stage.statut,
          entreprise?.nom,
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
    stages,
    entreprises,
    search,
  ]);


  /* =========================
     ENTREPRISE
  ========================= */

  const getEntrepriseName = (
    entrepriseId
  ) => {

    const entreprise =
      entreprises.find(
        (item) =>
          item.id ===
          Number(entrepriseId)
      );


    return (
      entreprise?.nom ||
      "Entreprise inconnue"
    );
  };


  /* =========================
     AJOUTER UNE OFFRE
  ========================= */

  const handleAddOfferClick = () => {

    /*
     * ETUDIANT :
     * consultation autorisée,
     * création interdite.
     */

    if (
      user?.role === "ETUDIANT"
    ) {

      showNotification(
        "Accès refusé",
        "La création d'une offre de stage est réservée aux administrateurs et aux entreprises.",
        "error"
      );

      return;
    }


    /*
     * AUTRE UTILISATEUR NON AUTORISÉ
     */

    if (!canManageStages) {

      showNotification(
        "Accès refusé",
        "Vous n'avez pas l'autorisation de créer une offre de stage.",
        "error"
      );

      return;
    }


    openAddModal();
  };


  /* =========================
     MODAL AJOUT
  ========================= */

  const openAddModal = () => {

    setEditingStage(null);


    setFormData({
      ...EMPTY_FORM,

      entreprise:
        entreprises.length > 0
          ? String(
              entreprises[0].id
            )
          : "",
    });


    setShowModal(true);
  };


  /* =========================
     MODIFIER
  ========================= */

  const openEditModal = (
    stage
  ) => {

    /*
     * ETUDIANT NE PEUT PAS MODIFIER
     */

    if (!canManageStages) {

      showNotification(
        "Accès refusé",
        "La modification d'une offre de stage est réservée aux administrateurs et aux entreprises.",
        "error"
      );

      return;
    }


    setEditingStage(stage);


    setFormData({
      titre:
        stage.titre || "",

      description:
        stage.description || "",

      domaine:
        stage.domaine || "",

      competences_requises:
        stage.competences_requises ||
        "",

      entreprise:
        String(
          stage.entreprise || ""
        ),

      duree:
        stage.duree || "",

      date_debut:
        stage.date_debut || "",

      date_fin:
        stage.date_fin || "",

      nombre_places:
        stage.nombre_places || 1,

      statut:
        stage.statut ||
        "OUVERT",
    });


    setShowModal(true);
  };


  /* =========================
     FERMER MODAL
  ========================= */

  const closeModal = () => {

    if (saving) {
      return;
    }


    setShowModal(false);

    setEditingStage(null);

    setFormData(
      EMPTY_FORM
    );
  };


  /* =========================
     CHANGEMENT FORMULAIRE
  ========================= */

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          name ===
          "nombre_places"
            ? Number(value)
            : value,
      })
    );
  };


  /* =========================
     ENREGISTRER
  ========================= */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    /*
     * DOUBLE PROTECTION FRONTEND
     */

    if (!canManageStages) {

      showNotification(
        "Accès refusé",
        "Vous n'avez pas l'autorisation d'enregistrer une offre de stage.",
        "error"
      );

      return;
    }


    if (
      formData.date_fin <
      formData.date_debut
    ) {

      showNotification(
        "Dates invalides",
        "La date de fin doit être postérieure à la date de début.",
        "error"
      );

      return;
    }


    if (
      !formData.entreprise
    ) {

      showNotification(
        "Entreprise obligatoire",
        "Sélectionnez une entreprise.",
        "error"
      );

      return;
    }


    setSaving(true);


    try {

      if (editingStage) {

        const response =
          await api.put(
            `stages/${editingStage.id}/`,
            formData
          );


        setStages(
          (previous) =>
            previous.map(
              (stage) =>
                stage.id ===
                editingStage.id
                  ? response.data
                  : stage
            )
        );


        showNotification(
          "Offre modifiée",
          `L'offre « ${formData.titre} » a été modifiée avec succès.`
        );

      } else {

        const response =
          await api.post(
            "stages/",
            formData
          );


        setStages(
          (previous) => [
            response.data,
            ...previous,
          ]
        );


        showNotification(
          "Nouvelle offre",
          `L'offre « ${formData.titre} » a été créée avec succès.`
        );
      }


      closeModal();

    } catch (error) {

      console.error(
        "Erreur enregistrement offre :",
        error
      );


      let message =
        "Impossible d'enregistrer l'offre.";


      if (
        error.response?.data
      ) {

        const data =
          error.response.data;


        if (
          typeof data ===
          "object"
        ) {

          message =
            Object.entries(data)
              .map(
                ([field, value]) => {

                  const text =
                    Array.isArray(
                      value
                    )
                      ? value.join(
                          " "
                        )
                      : String(
                          value
                        );


                  return `${field} : ${text}`;
                }
              )
              .join(
                "\n"
              );
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


  /* =========================
     SUPPRIMER
  ========================= */

  const handleDelete = async (
    stage
  ) => {

    /*
     * ETUDIANT NE PEUT PAS SUPPRIMER
     */

    if (!canManageStages) {

      showNotification(
        "Accès refusé",
        "La suppression d'une offre de stage est réservée aux administrateurs et aux entreprises.",
        "error"
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer l'offre « ${stage.titre} » ?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(
        stage.id
      );


      await api.delete(
        `stages/${stage.id}/`
      );


      setStages(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              stage.id
          )
      );


      showNotification(
        "Offre supprimée",
        `L'offre « ${stage.titre} » a été supprimée.`
      );

    } catch (error) {

      console.error(
        "Erreur suppression offre :",
        error
      );


      showNotification(
        "Erreur",
        "Impossible de supprimer cette offre.",
        "error"
      );

    } finally {

      setDeletingId(
        null
      );
    }
  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <div className="stages-state">

        <div className="stages-spinner" />

        <p>
          Chargement des offres...
        </p>

      </div>
    );
  }


  /* =========================
     ACCÈS REFUSÉ AU MODULE
  ========================= */

  if (
    error ===
    "Vous n'avez pas accès à cette section."
  ) {

    return (
      <AccessDenied
        title="Accès refusé"
        message="Vous n'avez pas l'autorisation d'accéder à la gestion des offres de stage."
        module="Gestion des offres de stage"
        icon="📋"
      />
    );
  }


  /* =========================
     AUTRE ERREUR
  ========================= */

  if (error) {

    return (
      <div className="stages-state stages-error">

        <div className="stages-error-icon">
          !
        </div>

        <h2>
          Impossible de charger
          les offres
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={
            loadData
          }
        >
          Réessayer
        </button>

      </div>
    );
  }


  return (

    <div className="stages-page">

      {/* =========================
          NOTIFICATION
      ========================= */}

      {notification.visible && (

        <div
          className={`stages-toast stages-toast-${notification.type}`}
        >

          <div className="stages-toast-icon">

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

      <header className="stages-header">

        <div>

          <div className="stages-breadcrumb">

            Administration

            <span>
              /
            </span>

            Offres de stage

          </div>


          <span className="stages-kicker">
            GESTION DES STAGES
          </span>


          <h1>
            Offres de stage
          </h1>


          <p>
            Consultez les opportunités de stage
            proposées par les entreprises partenaires.
          </p>

        </div>


        {/* =========================
            AJOUTER UNE OFFRE
           ========================= */}

        <button
          className="stages-add-button"
          onClick={
            handleAddOfferClick
          }
        >

          <span>
            ＋
          </span>

          Ajouter une offre

        </button>

      </header>


      {/* =========================
          RECHERCHE
      ========================= */}

      <section className="stages-toolbar">

        <div className="stages-search">

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
            placeholder="Rechercher une offre..."
          />

        </div>


        <div className="stages-count">

          <strong>
            {
              filteredStages.length
            }
          </strong>

          <span>
            offre(s)
          </span>

        </div>

      </section>


      {/* =========================
          LISTE
      ========================= */}

      <section className="stages-card">

        <div className="stages-card-header">

          <div>

            <h2>
              Offres disponibles
            </h2>

            <p>
              Liste des offres de stage enregistrées.
            </p>

          </div>

        </div>


        {filteredStages.length ===
        0 ? (

          <div className="stages-empty">

            <div className="stages-empty-icon">
              📋
            </div>


            <h3>
              Aucune offre trouvée
            </h3>


            <p>
              Aucune offre ne correspond à votre recherche.
            </p>

          </div>

        ) : (

          <div className="stages-table-wrapper">

            <table className="stages-table">

              <thead>

                <tr>

                  <th>
                    Offre
                  </th>

                  <th>
                    Entreprise
                  </th>

                  <th>
                    Domaine
                  </th>

                  <th>
                    Période
                  </th>

                  <th>
                    Places
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredStages.map(
                  (stage) => (

                    <tr
                      key={
                        stage.id
                      }
                    >

                      <td>

                        <div className="stage-identity">

                          <div className="stage-avatar">

                            {(
                              stage.titre?.[0] ||
                              "S"
                            ).toUpperCase()}

                          </div>


                          <div>

                            <strong>
                              {
                                stage.titre
                              }
                            </strong>


                            <span>
                              {
                                stage.duree
                              }
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        {
                          getEntrepriseName(
                            stage.entreprise
                          )
                        }

                      </td>


                      <td>

                        <span className="stage-domain">

                          {
                            stage.domaine
                          }

                        </span>

                      </td>


                      <td>

                        <div className="stage-period">

                          <span>
                            {
                              stage.date_debut
                            }
                          </span>

                          <small>
                            →
                          </small>

                          <span>
                            {
                              stage.date_fin
                            }
                          </span>

                        </div>

                      </td>


                      <td>

                        <span className="stage-places">

                          {
                            stage.nombre_places
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            stage.statut ===
                            "OUVERT"
                              ? "stage-status stage-open"
                              : "stage-status stage-closed"
                          }
                        >

                          <span />

                          {
                            stage.statut ===
                            "OUVERT"
                              ? "Ouverte"
                              : "Fermée"
                          }

                        </span>

                      </td>


                      <td>

                        <div className="stages-actions">

                          {/* Modifier */}

                          <button
                            className="stage-edit"
                            onClick={() =>
                              openEditModal(
                                stage
                              )
                            }
                          >
                            Modifier
                          </button>


                          {/* Supprimer */}

                          <button
                            className="stage-delete"
                            disabled={
                              deletingId ===
                              stage.id
                            }
                            onClick={() =>
                              handleDelete(
                                stage
                              )
                            }
                          >

                            {
                              deletingId ===
                              stage.id
                                ? "..."
                                : "Supprimer"
                            }

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

        <div className="stages-modal-overlay">

          <div className="stages-modal">

            <div className="stages-modal-header">

              <div>

                <span>
                  {editingStage
                    ? "MODIFICATION"
                    : "NOUVELLE OFFRE"}
                </span>


                <h2>

                  {editingStage
                    ? "Modifier l'offre"
                    : "Créer une offre de stage"}

                </h2>

              </div>


              <button
                type="button"
                className="stage-modal-close"
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

              <div className="stages-form-grid">

                {/* Titre */}

                <div className="stage-field stage-field-full">

                  <label>
                    Titre de l'offre
                  </label>


                  <input
                    type="text"
                    name="titre"
                    value={
                      formData.titre
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex. Développeur Web"
                    required
                  />

                </div>


                {/* Domaine */}

                <div className="stage-field">

                  <label>
                    Domaine
                  </label>


                  <input
                    type="text"
                    name="domaine"
                    value={
                      formData.domaine
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex. Informatique"
                    required
                  />

                </div>


                {/* Entreprise */}

                <div className="stage-field">

                  <label>
                    Entreprise
                  </label>


                  <select
                    name="entreprise"
                    value={
                      formData.entreprise
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Sélectionner une entreprise
                    </option>


                    {entreprises.map(
                      (entreprise) => (

                        <option
                          key={
                            entreprise.id
                          }
                          value={
                            entreprise.id
                          }
                        >

                          {
                            entreprise.nom
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* Durée */}

                <div className="stage-field">

                  <label>
                    Durée
                  </label>


                  <input
                    type="text"
                    name="duree"
                    value={
                      formData.duree
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ex. 3 mois"
                    required
                  />

                </div>


                {/* Nombre places */}

                <div className="stage-field">

                  <label>
                    Nombre de places
                  </label>


                  <input
                    type="number"
                    name="nombre_places"
                    value={
                      formData.nombre_places
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    required
                  />

                </div>


                {/* Date début */}

                <div className="stage-field">

                  <label>
                    Date de début
                  </label>


                  <input
                    type="date"
                    name="date_debut"
                    value={
                      formData.date_debut
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* Date fin */}

                <div className="stage-field">

                  <label>
                    Date de fin
                  </label>


                  <input
                    type="date"
                    name="date_fin"
                    value={
                      formData.date_fin
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* Statut */}

                <div className="stage-field">

                  <label>
                    Statut
                  </label>


                  <select
                    name="statut"
                    value={
                      formData.statut
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="OUVERT">
                      Ouvert
                    </option>


                    <option value="FERME">
                      Fermé
                    </option>

                  </select>

                </div>


                {/* Compétences */}

                <div className="stage-field stage-field-full">

                  <label>
                    Compétences requises
                  </label>


                  <textarea
                    name="competences_requises"
                    value={
                      formData.competences_requises
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    placeholder="Ex. HTML, CSS, JavaScript, React..."
                    required
                  />

                </div>


                {/* Description */}

                <div className="stage-field stage-field-full">

                  <label>
                    Description
                  </label>


                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="5"
                    placeholder="Description détaillée du stage..."
                    required
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div className="stages-modal-actions">

                <button
                  type="button"
                  className="stage-cancel"
                  onClick={
                    closeModal
                  }
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="stage-save"
                  disabled={
                    saving
                  }
                >

                  {
                    saving
                      ? "Enregistrement..."
                      : editingStage
                      ? "Enregistrer les modifications"
                      : "Créer l'offre"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Stages;