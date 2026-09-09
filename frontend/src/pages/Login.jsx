import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("token/", {
        username,
        password,
      });

      console.log("Connexion réussie :", response.data);

      localStorage.setItem(
        "access_token",
        response.data.access
      );

      localStorage.setItem(
        "refresh_token",
        response.data.refresh
      );

      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard");

    } catch (error) {
      console.error("Erreur de connexion :", error);

      if (error.response?.status === 401) {
        setError(
          "Nom d'utilisateur ou mot de passe incorrect."
        );
      } else if (error.response) {
        setError(
          "Une erreur est survenue sur le serveur."
        );
      } else {
        setError(
          "Impossible de contacter le serveur Django."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            GS
          </div>

          <h1>Gestion des stages</h1>

          <p>
            Connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <label htmlFor="username">
              Nom d'utilisateur
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Entrez votre nom d'utilisateur"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Entrez votre mot de passe"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>

        </form>

        <div className="login-register">
          <span>
            Vous n'avez pas encore de compte ?
          </span>

          <Link to="/register">
            Créer un compte
          </Link>
        </div>

        <div className="login-security">
          Authentification sécurisée
        </div>

      </div>

    </div>
  );
}

export default Login;