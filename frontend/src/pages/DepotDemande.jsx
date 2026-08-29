import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./DepotDemande.css";

const EMPTY_FORM = {
  entreprise: "",
  stage: "",
  type_demande: "STAGE",
  objet: "",
  description: "",
  lettre_motivation_texte: "",
};

function DepotDemande() {
  const navigate = useNavigate();

  const [entreprises, setEntreprises] = useState([]);
  const [stages, setStages] = useState([]);

  const [formData, setFormData] = useState(
    EMPTY_FORM
  );

  // =====================================================
  // FICHIERS
  // =====================================================

  const [cvFile, setCvFile] = useState(null);

  const [lettreMotivationFile, setLettreMotivationFile] =
    useState(null);

  const [lettreMode, setLettreMode] =
    useState("texte");

  // =====================================================
  // ETATS
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notification, setNotification] =
    useState({
      visible: false,
      type: "",
      title: "",
      message: "",
    });

  // =====================================================
  // UTILISATEUR
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

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
        entreprisesResponse,
        stagesResponse,
      ] = await Promise.all([
        api.get("entreprises/"),
        api.get("stages/"),
      ]);

      const entreprisesData =
        Array.isArray(entreprisesResponse.data)
          ? entreprisesResponse.data
          : entreprisesResponse.data.results || [];

      const stagesData =
        Array.isArray(stagesResponse.data)
          ? stagesResponse.data
          : stagesResponse.data.results || [];

      setEntreprises(entreprisesData);
      setStages(stagesData);

    } catch (error) {
      console.error(
        "Erreur chargement dépôt demande :",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Votre session a expiré."
        );
      } else {
        setError(
          "Impossible de charger les informations nécessaires au dépôt de la demande."
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
  // CHANGEMENT DES CHAMPS
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CV
  // =====================================================

  const handleCvChange = (e) => {
    const file = e.target.files?.[0] || null;

    setCvFile(file);
  };

  // =====================================================
  // LETTRE DE MOTIVATION - FICHIER
  // =====================================================

  const handleLettreFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setLettreMotivationFile(file);
  };

  // =====================================================
  // CHANGEMENT MODE LETTRE
  // =====================================================

  const handleLettreModeChange = (mode) => {
    setLettreMode(mode);

    if (mode === "texte") {
      setLettreMotivationFile(null);
    }

    if (mode === "fichier") {
      setFormData((previous) => ({
        ...previous,
        lettre_motivation_texte: "",
      }));
    }
  };

  // =====================================================
  // ENVOI
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // VALIDATION TYPE
    // ===================================================

    if (!formData.type_demande) {
      showNotification(
        "Type obligatoire",
        "Veuillez sélectionner le type de demande.",
        "error"
      );

      return;
    }

    // ===================================================
    // VALIDATION OBJET
    // ===================================================

    if (!formData.objet.trim()) {
      showNotification(
        "Objet obligatoire",
        "Veuillez renseigner l'objet de votre demande.",
        "error"
      );

      return;
    }

    // ===================================================
    // VALIDATION DESCRIPTION
    // ===================================================

    if (!formData.description.trim()) {
      showNotification(
        "Description obligatoire",
        "Veuillez renseigner la description de votre demande.",
        "error"
      );

      return;
    }

    // ===================================================
    // VALIDATION LETTRE
    // ===================================================

    if (
      lettreMode === "texte" &&
      !formData.lettre_motivation_texte.trim()
    ) {
      showNotification(
        "Lettre de motivation obligatoire",
        "Veuillez rédiger votre lettre de motivation.",
        "error"
      );

      return;
    }

    if (
      lettreMode === "fichier" &&
      !lettreMotivationFile
    ) {
      showNotification(
        "Lettre de motivation obligatoire",
        "Veuillez importer votre lettre de motivation.",
        "error"
      );

      return;
    }

    setSaving(true);

    try {
      // =================================================
      // FORMDATA
      // =================================================

      const data = new FormData();

      // =================================================
      // ENTREPRISE
      // =================================================

      if (formData.entreprise) {
        data.append(
          "entreprise",
          Number(formData.entreprise)
        );
      }

      // =================================================
      // STAGE
      // =================================================

      if (formData.stage) {
        data.append(
          "stage",
          Number(formData.stage)
        );
      }

      // =================================================
      // TYPE
      // =================================================

      data.append(
        "type_demande",
        formData.type_demande
      );

      // =================================================
      // OBJET
      // =================================================

      data.append(
        "objet",
        formData.objet.trim()
      );

      // =================================================
      // DESCRIPTION
      // =================================================

      data.append(
        "description",
        formData.description.trim()
      );

      // =================================================
      // CV
      // =================================================

      if (cvFile) {
        data.append(
          "cv",
          cvFile
        );
      }

      // =================================================
      // LETTRE DE MOTIVATION
      // =================================================

      if (lettreMode === "texte") {
        data.append(
          "lettre_motivation_texte",
          formData.lettre_motivation_texte.trim()
        );
      }

      if (lettreMode === "fichier") {
        data.append(
          "lettre_motivation_fichier",
          lettreMotivationFile
        );
      }

      // =================================================
      // ENVOI API
      // =================================================

      await api.post(
        "demandes/",
        data
      );

      // =================================================
      // SUCCES
      // =================================================

      showNotification(
        "Demande envoyée",
        "Votre demande a été déposée avec succès."
      );

      // =================================================
      // RESET FORMULAIRE
      // =================================================

      setFormData(
        EMPTY_FORM
      );

      setCvFile(null);

      setLettreMotivationFile(null);

      setLettreMode("texte");

      // =================================================
      // RESET INPUTS FICHIERS
      // =================================================

      const fileInputs =
        document.querySelectorAll(
          'input[type="file"]'
        );

      fileInputs.forEach(
        (input) => {
          input.value = "";
        }
      );

    } catch (error) {
      console.error(
        "Erreur dépôt demande :",
        error
      );

      let message =
        "Impossible d'envoyer la demande.";

      // =================================================
      // AFFICHAGE DES ERREURS DJANGO
      // =================================================

      if (error.response?.data) {
        const responseData =
          error.response.data;

        if (
          typeof responseData === "object" &&
          responseData !== null
        ) {
          message =
            Object.entries(responseData)
              .map(
                ([field, value]) => {
                  const text =
                    Array.isArray(value)
                      ? value.join(" ")
                      : String(value);

                  return `${field} : ${text}`;
                }
              )
              .join("\n");
        } else {
          message = String(
            responseData
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

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <div className="depot-demande-state">

        <div className="depot-demande-spinner" />

        <p>
          Chargement du formulaire...
        </p>

      </div>
    );
  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (error) {
    return (
      <div className="depot-demande-state depot-demande-error">

        <div className="depot-demande-error-icon">
          !
        </div>

        <h2>
          Impossible de charger
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
  // PROTECTION ETUDIANT
  // =====================================================

  if (user?.role !== "ETUDIANT") {
    return (
      <div className="depot-demande-state depot-demande-error">

        <div className="depot-demande-error-icon">
          🔒
        </div>

        <h2>
          Accès refusé
        </h2>

        <p>
          Seuls les étudiants peuvent
          déposer une demande.
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

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="depot-demande-page">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.visible && (
        <div
          className={`depot-demande-toast depot-demande-toast-${notification.type}`}
        >

          <div className="depot-demande-toast-icon">

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
            type="button"
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

      <header className="depot-demande-header">

        <div>

          <div className="depot-demande-breadcrumb">

            Espace étudiant

            <span>/</span>

            Dépôt de demande

          </div>

          <span className="depot-demande-kicker">
            NOUVELLE DEMANDE
          </span>

          <h1>
            Dépôt de demande
          </h1>

          <p>
            Soumettez votre demande à
            l'administration et à l'entreprise
            concernée.
          </p>

        </div>

      </header>

      {/* =================================================
          FORMULAIRE
      ================================================= */}

      <section className="depot-demande-card">

        {/* =================================================
            ENTETE CARD
        ================================================= */}

        <div className="depot-demande-card-header">

          <div className="depot-demande-main-icon">
            📤
          </div>

          <div>

            <h2>
              Informations de la demande
            </h2>

            <p>
              Remplissez les informations
              ci-dessous avant d'envoyer votre demande.
            </p>

          </div>

        </div>

        <form
          className="depot-demande-form"
          onSubmit={handleSubmit}
        >

          <div className="depot-demande-grid">

            {/* =================================================
                TYPE
            ================================================= */}

            <div className="depot-field">

              <label>
                Type de demande
              </label>

              <select
                name="type_demande"
                value={
                  formData.type_demande
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="STAGE">
                  Demande de stage
                </option>

                <option value="CONVENTION">
                  Demande de convention
                </option>

                <option value="AUTRE">
                  Autre demande
                </option>

              </select>

            </div>

            {/* =================================================
                ENTREPRISE
            ================================================= */}

            <div className="depot-field">

              <label>
                Entreprise concernée
              </label>

              <select
                name="entreprise"
                value={
                  formData.entreprise
                }
                onChange={
                  handleChange
                }
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
                      {entreprise.nom}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* =================================================
                STAGE
            ================================================= */}

            <div className="depot-field depot-field-full">

              <label>
                Stage concerné
              </label>

              <select
                name="stage"
                value={
                  formData.stage
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Sélectionner une offre de stage
                </option>

                {stages.map(
                  (stage) => (
                    <option
                      key={
                        stage.id
                      }
                      value={
                        stage.id
                      }
                    >
                      {stage.titre}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* =================================================
                OBJET
            ================================================= */}

            <div className="depot-field depot-field-full">

              <label>
                Objet de la demande
              </label>

              <input
                type="text"
                name="objet"
                value={
                  formData.objet
                }
                onChange={
                  handleChange
                }
                placeholder="Ex. Demande de convention de stage"
                maxLength={255}
                required
              />

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="depot-field depot-field-full">

              <label>
                Description de la demande
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows="7"
                placeholder="Expliquez clairement votre demande..."
                required
              />

              <small className="depot-field-help">
                Donnez suffisamment de détails
                pour faciliter le traitement
                de votre demande.
              </small>

            </div>

            {/* =================================================
                CV
            ================================================= */}

            <div className="depot-field depot-field-full">

              <label>
                CV
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={
                  handleCvChange
                }
              />

              <small className="depot-field-help">

                Formats acceptés :
                PDF, DOC ou DOCX.

                {cvFile && (
                  <>
                    {" "}
                    Fichier sélectionné :
                    {" "}
                    <strong>
                      {cvFile.name}
                    </strong>
                  </>
                )}

              </small>

            </div>

            {/* =================================================
                LETTRE DE MOTIVATION
            ================================================= */}

            <div className="depot-field depot-field-full">

              <label>
                Lettre de motivation
              </label>

              {/* =================================================
                  CHOIX DU MODE
              ================================================= */}

              <div className="depot-letter-choice">

                <label className="depot-radio-option">

                  <input
                    type="radio"
                    name="lettre_mode"
                    value="texte"
                    checked={
                      lettreMode === "texte"
                    }
                    onChange={() =>
                      handleLettreModeChange(
                        "texte"
                      )
                    }
                  />

                  <span>
                    Écrire la lettre
                  </span>

                </label>

                <label className="depot-radio-option">

                  <input
                    type="radio"
                    name="lettre_mode"
                    value="fichier"
                    checked={
                      lettreMode === "fichier"
                    }
                    onChange={() =>
                      handleLettreModeChange(
                        "fichier"
                      )
                    }
                  />

                  <span>
                    Importer la lettre
                  </span>

                </label>

              </div>

              {/* =================================================
                  LETTRE EN TEXTE
              ================================================= */}

              {lettreMode === "texte" && (
                <div className="depot-letter-text">

                  <textarea
                    name="lettre_motivation_texte"
                    value={
                      formData.lettre_motivation_texte
                    }
                    onChange={
                      handleChange
                    }
                    rows="10"
                    placeholder="Rédigez votre lettre de motivation ici..."
                  />

                  <small className="depot-field-help">

                    Rédigez directement votre
                    lettre de motivation.

                  </small>

                </div>
              )}

              {/* =================================================
                  LETTRE EN FICHIER
              ================================================= */}

              {lettreMode === "fichier" && (
                <div className="depot-letter-file">

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={
                      handleLettreFileChange
                    }
                  />

                  <small className="depot-field-help">

                    Formats acceptés :
                    PDF, DOC ou DOCX.

                    {lettreMotivationFile && (
                      <>
                        {" "}
                        Fichier sélectionné :
                        {" "}
                        <strong>
                          {
                            lettreMotivationFile.name
                          }
                        </strong>
                      </>
                    )}

                  </small>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="depot-demande-information">

            <div className="depot-demande-information-icon">
              🔔
            </div>

            <div>

              <strong>
                Information
              </strong>

              <p>
                Après l'envoi, votre demande
                sera enregistrée et une notification
                sera envoyée aux responsables concernés.
              </p>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="depot-demande-actions">

            <button
              type="button"
              className="depot-demande-cancel"
              onClick={() =>
                navigate(-1)
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="depot-demande-submit"
              disabled={saving}
            >

              {saving
                ? "Envoi en cours..."
                : "📤 Déposer la demande"}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

export default DepotDemande;