import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Evaluations.css";

function Evaluations() {
  // =========================================================
  // ÉTATS
  // =========================================================

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

  // =========================================================
  // UTILISATEUR CONNECTÉ
  // =========================================================

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

  // =========================================================
  // EXTRAIRE LES DONNÉES API
  // =========================================================

  const extractData = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
      return response.data.results;
    }

    return [];
  };

  // =========================================================
  // CHARGEMENT INITIAL
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CHARGER LES DONNÉES
  // =========================================================

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

  // =========================================================
  // NOTIFICATION
  // =========================================================

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

  // =========================================================
  // TITRE DU STAGE
  // =========================================================

  const getStageTitle = (stageId) => {
    const stage = stages.find(
      (item) =>
        Number(item.id) === Number(stageId)
    );

    return stage?.titre || `Stage #${stageId}`;
  };

  // =========================================================
  // TYPE ÉVALUATION
  // =========================================================

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

  // =========================================================
  // STATUT RAPPORT
  // =========================================================

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

  // =========================================================
  // CLASSE NOTE
  // =========================================================

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

  // =========================================================
  // TROUVER UNE ÉVALUATION
  // =========================================================

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

  // =========================================================
  // CONSTRUIRE LES LIGNES
  // =========================================================

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

  // =========================================================
  // FILTRAGE + RECHERCHE
  // =========================================================

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

      // -------------------------------------------------------
      // FILTRE ENTREPRISE
      // -------------------------------------------------------

      if (
        filterType === "ENTREPRISE" &&
        !entrepriseEvaluation
      ) {
        return false;
      }

      // -------------------------------------------------------
      // FILTRE ENSEIGNANT
      // -------------------------------------------------------

      if (
        filterType === "ENSEIGNANT" &&
        !enseignantEvaluation
      ) {
        return false;
      }

      // -------------------------------------------------------
      // RECHERCHE
      // -------------------------------------------------------

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

  // =========================================================
  // OUVRIR MODAL
  // =========================================================

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

  // =========================================================
  // FERMER MODAL
  // =========================================================

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

  // =========================================================
  // CHANGEMENT FORMULAIRE
  // =========================================================

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

  // =========================================================
  // ENREGISTRER ÉVALUATION
  // =========================================================

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

    // -------------------------------------------------------
    // NOTE
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // COMMENTAIRE
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // RAPPORT
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // DOUBLON
    // -------------------------------------------------------

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

      // Ajouter seulement l'évaluation
      // sans toucher aux rapports.

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

  // =========================================================
  // SUPPRESSION ADMIN
  // =========================================================

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

      /*
       * IMPORTANT :
       * On supprime uniquement l'évaluation
       * de la liste evaluations.
       *
       * On ne touche PAS à rapports.
       */

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

  // =========================================================
  // ÉTAT CHARGEMENT
  // =========================================================

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

  // =========================================================
  // ÉTAT ERREUR
  // =========================================================

  if (error) {
    return (
      <div className="evaluations-state evaluations-error">

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

  // =========================================================
  // INTERFACE
  // =========================================================

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

            <span>
              /
            </span>

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
            🎓
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
            🏢
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
            👨‍🏫
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

          <span>
            ⌕
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

            <h2>
              Rapports et évaluations
            </h2>

            <p>
              Chaque rapport peut recevoir
              une évaluation de l'entreprise
              et une évaluation de l'encadreur.
            </p>

          </div>

          <span>
            {filteredRows.length} rapport(s)
          </span>

        </div>

        {/* ===================================================
            AUCUN RAPPORT
        =================================================== */}

        {filteredRows.length === 0 ? (

          <div className="evaluations-empty">

            <div className="evaluations-empty-icon">
              📄
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

                  <th>
                    Rapport
                  </th>

                  <th>
                    Stage
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Entreprise
                  </th>

                  <th>
                    Encadrement
                  </th>

                  <th>
                    Actions
                  </th>

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

                        {/* ===================================
                            RAPPORT
                        =================================== */}

                        <td>

                          <div className="evaluation-user">

                            <div className="evaluation-avatar">
                              📄
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

                        {/* ===================================
                            STAGE
                        =================================== */}

                        <td>

                          <strong className="evaluation-stage">
                            {getStageTitle(
                              rapport.stage
                            )}
                          </strong>

                        </td>

                        {/* ===================================
                            STATUT
                        =================================== */}

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

                        {/* ===================================
                            ENTREPRISE
                        =================================== */}

                        <td>

                          {entrepriseEvaluation ? (

                            <div>

                              <span
                                className={getTypeClass(
                                  "ENTREPRISE"
                                )}
                              >
                                Entreprise
                              </span>

                              <br />

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

                        {/* ===================================
                            ENCADREMENT
                        =================================== */}

                        <td>

                          {enseignantEvaluation ? (

                            <div>

                              <span
                                className={getTypeClass(
                                  "ENSEIGNANT"
                                )}
                              >
                                Encadrement
                              </span>

                              <br />

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

                        {/* ===================================
                            ACTIONS
                        =================================== */}

                        <td>

                          <div className="evaluations-actions">

                            {/* ---------------------------------
                                ENTREPRISE
                            --------------------------------- */}

                            {isEntreprise && (

                              entrepriseEvaluation ? (

                                <span className="evaluation-done">
                                  ✓ Évalué
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

                            {/* ---------------------------------
                                ENSEIGNANT
                            --------------------------------- */}

                            {isEnseignant && (

                              enseignantEvaluation ? (

                                <span className="evaluation-done">
                                  ✓ Évalué
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

                            {/* ---------------------------------
                                ADMIN
                            --------------------------------- */}

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

                            {/* ---------------------------------
                                ÉTUDIANT
                            --------------------------------- */}

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
                >
                  ×
                </button>

              </div>

              {/* INFORMATIONS RAPPORT */}

              <div className="evaluation-modal-report">

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

              {/* FORMULAIRE */}

              <form onSubmit={handleSubmit}>

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

                {/* ACTIONS MODAL */}

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