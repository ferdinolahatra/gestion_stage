import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Evaluations.css";

/* =========================================================
   ICÔNES SVG PROFESSIONNELLES
   Aucun package supplémentaire nécessaire
   ========================================================= */

const Icon = ({ name, size = 20, strokeWidth = 2 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "evaluations-icon",
    "aria-hidden": "true",
  };

  const icons = {
    student: (
      <>
        <path d="M3 9l9-5 9 5-9 5-9-5Z" />
        <path d="M7 12v5c2.5 2 7.5 2 10 0v-5" />
        <path d="M21 10v5" />
      </>
    ),

    building: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 7h2" />
        <path d="M13 7h2" />
        <path d="M9 11h2" />
        <path d="M13 11h2" />
        <path d="M9 15h2" />
        <path d="M13 15h2" />
      </>
    ),

    teacher: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21a7 7 0 0 1 14 0" />
        <path d="M18 10h3" />
        <path d="M20 8v4" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h6" />
      </>
    ),

    check: (
      <path d="m5 12 4 4L19 6" />
    ),

    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),

    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </>
    ),

    save: (
      <>
        <path d="M5 4h12l2 2v14H5Z" />
        <path d="M8 4v6h8V4" />
        <path d="M8 20v-6h8v6" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.3 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {icons[name] || icons.file}
    </svg>
  );
};

function Evaluations() {
  /* =========================================================
     ÉTATS
     ========================================================= */

  const [evaluations, setEvaluations] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [stages, setStages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("TOUS");

  const [showModal, setShowModal] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  const [formData, setFormData] = useState({
    note: "",
    commentaire: "",
  });

  const [notification, setNotification] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  /* =========================================================
     UTILISATEUR CONNECTÉ
     ========================================================= */

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const isEtudiant = user?.role === "ETUDIANT";
  const isAdmin = user?.role === "ADMIN";
  const isEnseignant = user?.role === "ENSEIGNANT";
  const isEntreprise = user?.role === "ENTREPRISE";

  const evaluatorType = isEntreprise
    ? "ENTREPRISE"
    : isEnseignant
      ? "ENSEIGNANT"
      : null;

  /* =========================================================
     EXTRAIRE LES DONNÉES API
     ========================================================= */

  const extractData = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
      return response.data.results;
    }

    return [];
  };

  /* =========================================================
     CHARGEMENT INITIAL
     ========================================================= */

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     CHARGER LES DONNÉES
     ========================================================= */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        evaluationsResponse,
        rapportsResponse,
        stagesResponse,
      ] = await Promise.all([
        api.get("evaluations/"),
        api.get("rapports/"),
        api.get("stages/"),
      ]);

      const evaluationsData =
        extractData(evaluationsResponse);

      const rapportsData =
        extractData(rapportsResponse);

      const stagesData =
        extractData(stagesResponse);

      setEvaluations(evaluationsData);
      setRapports(rapportsData);
      setStages(stagesData);

      console.log(
        "===================================="
      );

      console.log(
        "ÉVALUATIONS :",
        evaluationsData
      );

      console.log(
        "RAPPORTS :",
        rapportsData
      );

      console.log(
        "STAGES :",
        stagesData
      );

      console.log(
        "UTILISATEUR :",
        user
      );

      console.log(
        "===================================="
      );
    } catch (err) {
      console.error(
        "Erreur chargement évaluations :",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Vous n'avez pas accès à cette page."
        );
      } else {
        setError(
          "Impossible de charger les données."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     NOTIFICATION
     ========================================================= */

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

  /* =========================================================
     TITRE DU STAGE
     ========================================================= */

  const getStageTitle = (stageId) => {
    const stage = stages.find(
      (item) =>
        Number(item.id) === Number(stageId)
    );

    return stage?.titre || `Stage #${stageId}`;
  };

  /* =========================================================
     TYPE ÉVALUATION
     ========================================================= */

  const getTypeLabel = (type) => {
    if (type === "ENSEIGNANT") {
      return "Encadrement";
    }

    if (type === "ENTREPRISE") {
      return "Entreprise";
    }

    return type || "—";
  };

  const getTypeClass = (type) => {
    if (type === "ENSEIGNANT") {
      return "evaluation-type type-teacher";
    }

    if (type === "ENTREPRISE") {
      return "evaluation-type type-company";
    }

    return "evaluation-type";
  };

  /* =========================================================
     STATUT RAPPORT
     ========================================================= */

  const getReportStatusLabel = (statut) => {
    switch (statut) {
      case "VALIDE":
        return "Rapport validé";

      case "REFUSE":
        return "Rapport refusé";

      case "EN_ATTENTE":
        return "Rapport en attente";

      default:
        return statut || "—";
    }
  };

  const getReportStatusClass = (statut) => {
    switch (statut) {
      case "VALIDE":
        return "report-status report-valid";

      case "REFUSE":
        return "report-status report-refused";

      default:
        return "report-status report-pending";
    }
  };

  /* =========================================================
     CLASSE NOTE
     ========================================================= */

  const getNoteClass = (note) => {
    const value = Number(note);

    if (value >= 16) {
      return "evaluation-note note-excellent";
    }

    if (value >= 12) {
      return "evaluation-note note-good";
    }

    if (value >= 10) {
      return "evaluation-note note-average";
    }

    return "evaluation-note note-low";
  };

  /* =========================================================
     TROUVER UNE ÉVALUATION
     ========================================================= */

  const getEvaluationByType = (
    rapport,
    type
  ) => {
    if (!rapport || !type) {
      return null;
    }

    return (
      evaluations.find((evaluation) => {
        const sameStage =
          Number(evaluation.stage) ===
          Number(rapport.stage);

        const sameStudent =
          rapport.etudiant == null ||
          evaluation.etudiant == null ||
          Number(evaluation.etudiant) ===
            Number(rapport.etudiant);

        const sameType =
          evaluation.type_evaluation === type;

        return (
          sameStage &&
          sameStudent &&
          sameType
        );
      }) || null
    );
  };

  /* =========================================================
     CONSTRUIRE LES LIGNES
     ========================================================= */

  const evaluationRows = useMemo(() => {
    return rapports.map((rapport) => {
      const entrepriseEvaluation =
        getEvaluationByType(
          rapport,
          "ENTREPRISE"
        );

      const enseignantEvaluation =
        getEvaluationByType(
          rapport,
          "ENSEIGNANT"
        );

      return {
        id: `rapport-${rapport.id}`,
        rapport,
        entrepriseEvaluation,
        enseignantEvaluation,
      };
    });
  }, [rapports, evaluations]);

  /* =========================================================
     FILTRAGE + RECHERCHE
     ========================================================= */

  const filteredRows = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return evaluationRows.filter((row) => {
      const rapport = row.rapport;

      const entrepriseEvaluation =
        row.entrepriseEvaluation;

      const enseignantEvaluation =
        row.enseignantEvaluation;

      if (
        filterType === "ENTREPRISE" &&
        !entrepriseEvaluation
      ) {
        return false;
      }

      if (
        filterType === "ENSEIGNANT" &&
        !enseignantEvaluation
      ) {
        return false;
      }

      if (!value) {
        return true;
      }

      const stageTitle =
        getStageTitle(rapport.stage);

      const fields = [
        rapport.titre,
        rapport.commentaire,
        rapport.statut,
        stageTitle,
        entrepriseEvaluation?.commentaire,
        entrepriseEvaluation?.note,
        enseignantEvaluation?.commentaire,
        enseignantEvaluation?.note,
      ];

      return fields
        .filter(
          (field) =>
            field !== null &&
            field !== undefined
        )
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [
    evaluationRows,
    search,
    filterType,
    stages,
  ]);

  /* =========================================================
     OUVRIR MODAL
     ========================================================= */

  const openEvaluationModal = (rapport) => {
    if (isEtudiant) {
      return;
    }

    if (isAdmin) {
      return;
    }

    if (!isEntreprise && !isEnseignant) {
      return;
    }

    if (rapport.statut !== "VALIDE") {
      showNotification(
        "Rapport non validé",
        "Ce rapport doit être validé avant de pouvoir être évalué.",
        "error"
      );

      return;
    }

    const existingEvaluation =
      getEvaluationByType(
        rapport,
        evaluatorType
      );

    if (existingEvaluation) {
      showNotification(
        "Évaluation déjà effectuée",
        "Vous avez déjà évalué ce rapport.",
        "error"
      );

      return;
    }

    setSelectedRapport(rapport);

    setFormData({
      note: "",
      commentaire: "",
    });

    setShowModal(true);
  };

  /* =========================================================
     FERMER MODAL
     ========================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedRapport(null);

    setFormData({
      note: "",
      commentaire: "",
    });
  };

  /* =========================================================
     CHANGEMENT FORMULAIRE
     ========================================================= */

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

  /* =========================================================
     ENREGISTRER ÉVALUATION
     ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRapport) {
      return;
    }

    if (!evaluatorType) {
      showNotification(
        "Accès refusé",
        "Votre rôle ne permet pas de créer une évaluation.",
        "error"
      );

      return;
    }

    const note = Number(
      formData.note
    );

    if (
      Number.isNaN(note) ||
      note < 0 ||
      note > 20
    ) {
      showNotification(
        "Note invalide",
        "La note doit être comprise entre 0 et 20.",
        "error"
      );

      return;
    }

    const commentaire =
      formData.commentaire.trim();

    if (!commentaire) {
      showNotification(
        "Commentaire obligatoire",
        "Veuillez saisir un commentaire.",
        "error"
      );

      return;
    }

    if (
      selectedRapport.statut !== "VALIDE"
    ) {
      showNotification(
        "Rapport non validé",
        "Le rapport doit être validé avant son évaluation.",
        "error"
      );

      return;
    }

    const existingEvaluation =
      getEvaluationByType(
        selectedRapport,
        evaluatorType
      );

    if (existingEvaluation) {
      showNotification(
        "Évaluation déjà effectuée",
        "Cette évaluation existe déjà.",
        "error"
      );

      closeModal();

      return;
    }

    setSaving(true);

    try {
      const payload = {
        stage: Number(
          selectedRapport.stage
        ),

        type_evaluation:
          evaluatorType,

        note: note,

        commentaire: commentaire,
      };

      console.log(
        "PAYLOAD ÉVALUATION :",
        payload
      );

      const response = await api.post(
        "evaluations/",
        payload
      );

      console.log(
        "ÉVALUATION CRÉÉE :",
        response.data
      );

      setEvaluations((previous) => [
        ...previous,
        response.data,
      ]);

      showNotification(
        "Évaluation enregistrée",
        `L'évaluation ${getTypeLabel(
          evaluatorType
        )} a été enregistrée avec succès.`
      );

      setShowModal(false);
      setSelectedRapport(null);

      setFormData({
        note: "",
        commentaire: "",
      });
    } catch (err) {
      console.error(
        "Erreur création évaluation :",
        err
      );

      let message =
        "Impossible d'enregistrer l'évaluation.";

      const data =
        err.response?.data;

      if (data) {
        if (
          typeof data === "object"
        ) {
          message = Object.entries(data)
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
          message = String(data);
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

  /* =========================================================
     SUPPRESSION ADMIN
     ========================================================= */

  const handleDelete = async (
    evaluation
  ) => {
    if (!isAdmin) {
      return;
    }

    if (!evaluation?.id) {
      return;
    }

    const typeLabel =
      getTypeLabel(
        evaluation.type_evaluation
      );

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer l'évaluation ${typeLabel} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        evaluation.id
      );

      await api.delete(
        `evaluations/${evaluation.id}/`
      );

      setEvaluations((previous) =>
        previous.filter(
          (item) =>
            Number(item.id) !==
            Number(evaluation.id)
        )
      );

      showNotification(
        "Évaluation supprimée",
        `L'évaluation ${typeLabel} a été supprimée. Le rapport reste affiché.`
      );
    } catch (err) {
      console.error(
        "Erreur suppression :",
        err
      );

      let message =
        "Impossible de supprimer cette évaluation.";

      if (err.response?.data) {
        const data =
          err.response.data;

        if (
          typeof data === "object"
        ) {
          message = Object.entries(data)
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
          message = String(data);
        }
      }

      showNotification(
        "Erreur",
        message,
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     CHARGEMENT
     ========================================================= */

  if (loading) {
    return (
      <div className="evaluations-state">
        <div className="evaluations-spinner" />

        <p>
          Chargement des évaluations...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERREUR
     ========================================================= */

  if (error) {
    return (
      <div className="evaluations-state evaluations-error">
        <div className="evaluations-error-icon">
          <Icon
            name="alert"
            size={30}
          />
        </div>

        <h2>
          Accès impossible
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={loadData}
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* =========================================================
     INTERFACE
     ========================================================= */

  return (
    <div className="evaluations-page">

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification.visible && (
        <div
          className={`evaluations-toast evaluations-toast-${notification.type}`}
        >
          <div className="evaluations-toast-icon">
            <Icon
              name={
                notification.type === "error"
                  ? "alert"
                  : "check"
              }
              size={19}
            />
          </div>

          <div className="evaluations-toast-content">
            <strong>
              {notification.title}
            </strong>

            <p>
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            className="evaluations-toast-close"
            onClick={() =>
              setNotification(
                (previous) => ({
                  ...previous,
                  visible: false,
                })
              )
            }
            aria-label="Fermer"
          >
            <Icon
              name="close"
              size={17}
            />
          </button>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="evaluations-header">
        <div>
          <div className="evaluations-breadcrumb">
            {isEtudiant
              ? "Espace étudiant"
              : isEntreprise
                ? "Espace entreprise"
                : isEnseignant
                  ? "Espace encadrement"
                  : "Administration"}

            <span>/</span>

            Évaluations
          </div>

          <span className="evaluations-kicker">
            SUIVI DES PERFORMANCES
          </span>

          <h1>
            Évaluations
          </h1>

          <p>
            Suivi des évaluations réalisées
            après le dépôt des rapports de stage.
          </p>
        </div>
      </header>

      {/* =====================================================
          MESSAGE ÉTUDIANT
      ===================================================== */}

      {isEtudiant && (
        <section className="evaluations-info-card">
          <div className="evaluations-info-icon">
            <Icon
              name="student"
              size={27}
            />
          </div>

          <div>
            <h3>
              Suivi de votre stage
            </h3>

            <p>
              Vos rapports apparaissent
              ci-dessous. L'entreprise et
              l'encadreur peuvent évaluer
              votre stage après validation
              du rapport.
            </p>

            <strong>
              Vous ne pouvez pas créer,
              modifier ou supprimer une
              évaluation.
            </strong>
          </div>
        </section>
      )}

      {/* =====================================================
          MESSAGE ENTREPRISE
      ===================================================== */}

      {isEntreprise && (
        <section className="evaluations-info-card">
          <div className="evaluations-info-icon">
            <Icon
              name="building"
              size={27}
            />
          </div>

          <div>
            <h3>
              Évaluation entreprise
            </h3>

            <p>
              Vous pouvez évaluer les
              étudiants après validation
              de leur rapport de stage.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          MESSAGE ENSEIGNANT
      ===================================================== */}

      {isEnseignant && (
        <section className="evaluations-info-card">
          <div className="evaluations-info-icon">
            <Icon
              name="teacher"
              size={27}
            />
          </div>

          <div>
            <h3>
              Évaluation de l'encadrement
            </h3>

            <p>
              Vous pouvez évaluer le stage
              de l'étudiant après validation
              de son rapport.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          BARRE DE RECHERCHE
      ===================================================== */}

      <section className="evaluations-toolbar">

        <div className="evaluations-search">
          <span className="evaluations-search-icon">
            <Icon
              name="search"
              size={19}
            />
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher un rapport ou un stage..."
          />
        </div>

        <div className="evaluations-filters">

          <button
            type="button"
            className={
              filterType === "TOUS"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterType("TOUS")
            }
          >
            Toutes
          </button>

          <button
            type="button"
            className={
              filterType === "ENSEIGNANT"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterType(
                "ENSEIGNANT"
              )
            }
          >
            Encadrement
          </button>

          <button
            type="button"
            className={
              filterType === "ENTREPRISE"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilterType(
                "ENTREPRISE"
              )
            }
          >
            Entreprise
          </button>

        </div>
      </section>

      {/* =====================================================
          CARTE PRINCIPALE
      ===================================================== */}

      <section className="evaluations-card">

        <div className="evaluations-card-header">
          <div>
            <span className="evaluations-section-label">
              ÉVALUATIONS
            </span>

            <h2>
              Rapports et évaluations
            </h2>

            <p>
              Chaque rapport peut recevoir
              une évaluation de l'entreprise
              et une évaluation de l'encadreur.
            </p>
          </div>

          <span className="evaluations-count">
            {filteredRows.length} rapport(s)
          </span>
        </div>

        {/* ===================================================
            AUCUN RAPPORT
        =================================================== */}

        {filteredRows.length === 0 ? (

          <div className="evaluations-empty">

            <div className="evaluations-empty-icon">
              <Icon
                name="file"
                size={34}
              />
            </div>

            <h3>
              Aucun rapport trouvé
            </h3>

            <p>
              Aucun rapport ne correspond
              aux critères sélectionnés.
            </p>

          </div>

        ) : (

          <div className="evaluations-table-wrapper">

            <table className="evaluations-table">

              <thead>
                <tr>
                  <th>Rapport</th>
                  <th>Stage</th>
                  <th>Statut</th>
                  <th>Entreprise</th>
                  <th>Encadrement</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredRows.map(
                  (row) => {

                    const rapport =
                      row.rapport;

                    const entrepriseEvaluation =
                      row.entrepriseEvaluation;

                    const enseignantEvaluation =
                      row.enseignantEvaluation;

                    const canEvaluate =
                      (isEntreprise ||
                        isEnseignant) &&
                      rapport.statut ===
                        "VALIDE";

                    return (
                      <tr
                        key={row.id}
                      >

                        {/* RAPPORT */}

                        <td>

                          <div className="evaluation-user">

                            <div className="evaluation-avatar">
                              <Icon
                                name="file"
                                size={19}
                              />
                            </div>

                            <div>
                              <strong>
                                {rapport.titre ||
                                  "Rapport de stage"}
                              </strong>

                              <span>
                                Rapport #{rapport.id}
                              </span>
                            </div>

                          </div>

                        </td>

                        {/* STAGE */}

                        <td>

                          <strong className="evaluation-stage">
                            {getStageTitle(
                              rapport.stage
                            )}
                          </strong>

                        </td>

                        {/* STATUT */}

                        <td>

                          <span
                            className={getReportStatusClass(
                              rapport.statut
                            )}
                          >
                            {getReportStatusLabel(
                              rapport.statut
                            )}
                          </span>

                        </td>

                        {/* ENTREPRISE */}

                        <td>

                          {entrepriseEvaluation ? (

                            <div className="evaluation-result">

                              <span
                                className={getTypeClass(
                                  "ENTREPRISE"
                                )}
                              >
                                Entreprise
                              </span>

                              <span
                                className={getNoteClass(
                                  entrepriseEvaluation.note
                                )}
                              >
                                {
                                  entrepriseEvaluation.note
                                }

                                <small>
                                  /20
                                </small>
                              </span>

                            </div>

                          ) : (

                            <span className="evaluation-pending">
                              En attente
                            </span>

                          )}

                        </td>

                        {/* ENCADREMENT */}

                        <td>

                          {enseignantEvaluation ? (

                            <div className="evaluation-result">

                              <span
                                className={getTypeClass(
                                  "ENSEIGNANT"
                                )}
                              >
                                Encadrement
                              </span>

                              <span
                                className={getNoteClass(
                                  enseignantEvaluation.note
                                )}
                              >
                                {
                                  enseignantEvaluation.note
                                }

                                <small>
                                  /20
                                </small>
                              </span>

                            </div>

                          ) : (

                            <span className="evaluation-pending">
                              En attente
                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="evaluations-actions">

                            {/* ENTREPRISE */}

                            {isEntreprise && (
                              entrepriseEvaluation ? (

                                <span className="evaluation-done">

                                  <Icon
                                    name="check"
                                    size={14}
                                  />

                                  Évalué

                                </span>

                              ) : canEvaluate ? (

                                <button
                                  type="button"
                                  className="evaluation-edit"
                                  onClick={() =>
                                    openEvaluationModal(
                                      rapport
                                    )
                                  }
                                >
                                  Évaluer
                                </button>

                              ) : null
                            )}

                            {/* ENSEIGNANT */}

                            {isEnseignant && (
                              enseignantEvaluation ? (

                                <span className="evaluation-done">

                                  <Icon
                                    name="check"
                                    size={14}
                                  />

                                  Évalué

                                </span>

                              ) : canEvaluate ? (

                                <button
                                  type="button"
                                  className="evaluation-edit"
                                  onClick={() =>
                                    openEvaluationModal(
                                      rapport
                                    )
                                  }
                                >
                                  Évaluer
                                </button>

                              ) : null
                            )}

                            {/* ADMIN */}

                            {isAdmin && (

                              <div className="admin-evaluation-actions">

                                {entrepriseEvaluation && (

                                  <button
                                    type="button"
                                    className="evaluation-delete"
                                    disabled={
                                      deletingId ===
                                      entrepriseEvaluation.id
                                    }
                                    onClick={() =>
                                      handleDelete(
                                        entrepriseEvaluation
                                      )
                                    }
                                  >

                                    <Icon
                                      name="trash"
                                      size={15}
                                    />

                                    {deletingId ===
                                    entrepriseEvaluation.id
                                      ? "Suppression..."
                                      : "Supprimer entreprise"}

                                  </button>

                                )}

                                {enseignantEvaluation && (

                                  <button
                                    type="button"
                                    className="evaluation-delete"
                                    disabled={
                                      deletingId ===
                                      enseignantEvaluation.id
                                    }
                                    onClick={() =>
                                      handleDelete(
                                        enseignantEvaluation
                                      )
                                    }
                                  >

                                    <Icon
                                      name="trash"
                                      size={15}
                                    />

                                    {deletingId ===
                                    enseignantEvaluation.id
                                      ? "Suppression..."
                                      : "Supprimer encadrement"}

                                  </button>

                                )}

                                {!entrepriseEvaluation &&
                                  !enseignantEvaluation && (

                                    <span className="evaluation-readonly">
                                      Aucune évaluation
                                    </span>

                                )}

                              </div>

                            )}

                            {/* ÉTUDIANT */}

                            {isEtudiant && (

                              <span className="evaluation-readonly">
                                Consultation uniquement
                              </span>

                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* =====================================================
          MODAL ÉVALUATION
      ===================================================== */}

      {showModal &&
        selectedRapport && (

          <div
            className="evaluations-modal-overlay"
            onMouseDown={(e) => {

              if (
                e.target ===
                e.currentTarget
              ) {
                closeModal();
              }

            }}
          >

            <div className="evaluations-modal">

              {/* HEADER */}

              <div className="evaluations-modal-header">

                <div>

                  <span>
                    NOUVELLE ÉVALUATION
                  </span>

                  <h2>
                    Évaluer le rapport
                  </h2>

                </div>

                <button
                  type="button"
                  className="evaluation-modal-close"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Fermer"
                >
                  <Icon
                    name="close"
                    size={20}
                  />
                </button>

              </div>

              {/* INFORMATIONS RAPPORT */}

              <div className="evaluation-modal-report">

                <div className="evaluation-modal-report-icon">
                  <Icon
                    name="file"
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    {selectedRapport.titre ||
                      "Rapport de stage"}
                  </strong>

                  <span>
                    {getStageTitle(
                      selectedRapport.stage
                    )}
                  </span>

                  <span>
                    Évaluation :{" "}
                    {getTypeLabel(
                      evaluatorType
                    )}
                  </span>

                </div>

              </div>

              {/* FORMULAIRE */}

              <form
                onSubmit={handleSubmit}
              >

                <div className="evaluations-form-grid">

                  {/* TYPE */}

                  <div className="evaluation-field">

                    <label>
                      Type d'évaluation
                    </label>

                    <input
                      type="text"
                      value={getTypeLabel(
                        evaluatorType
                      )}
                      disabled
                    />

                  </div>

                  {/* NOTE */}

                  <div className="evaluation-field">

                    <label>
                      Note / 20
                    </label>

                    <input
                      type="number"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      min="0"
                      max="20"
                      step="0.01"
                      placeholder="Ex. 15.50"
                      required
                      disabled={saving}
                    />

                  </div>

                  {/* COMMENTAIRE */}

                  <div className="evaluation-field evaluation-field-full">

                    <label>
                      Commentaire
                    </label>

                    <textarea
                      name="commentaire"
                      value={
                        formData.commentaire
                      }
                      onChange={handleChange}
                      rows="6"
                      placeholder="Saisissez votre évaluation du stage..."
                      required
                      disabled={saving}
                    />

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="evaluations-modal-actions">

                  <button
                    type="button"
                    className="evaluation-cancel"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="evaluation-save"
                    disabled={saving}
                  >

                    <Icon
                      name="save"
                      size={16}
                    />

                    {saving
                      ? "Enregistrement..."
                      : "Enregistrer l'évaluation"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>
  );
}

export default Evaluations;