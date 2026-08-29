import { useNavigate } from "react-router-dom";
import "./AccessDenied.css";

function AccessDenied({
  title = "Accès refusé",
  message = "Vous n'avez pas l'autorisation d'accéder à cette section.",
}) {
  const navigate = useNavigate();

  return (
    <div className="access-denied-page">

      <div className="access-denied-card">

        <div className="access-denied-icon-wrapper">

          <div className="access-denied-icon">
            🔒
          </div>

        </div>

        <span className="access-denied-label">
          ACCÈS RESTREINT
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {message}
        </p>

        <div className="access-denied-line" />

        <div className="access-denied-info">

          <span>
            👤
          </span>

          <div>
            <strong>
              Autorisation requise
            </strong>

            <small>
              Votre compte ne dispose pas des droits
              nécessaires pour consulter cette section.
            </small>
          </div>

        </div>

        <button
          className="access-denied-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span>
            ←
          </span>

          Retour au Dashboard
        </button>

      </div>

    </div>
  );
}

export default AccessDenied;