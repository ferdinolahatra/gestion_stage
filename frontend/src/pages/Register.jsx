import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    telephone: "",
    role: "ETUDIANT",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Téléphone : chiffres uniquement
    if (name === "telephone") {
      const onlyNumbers = value.replace(/\D/g, "");

      setFormData((prev) => ({
        ...prev,
        telephone: onlyNumbers.slice(0, 10),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.telephone && formData.telephone.length !== 10) {
      setError("Le numéro de téléphone doit contenir 10 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("register/", formData);

      console.log("Inscription réussie :", response.data);

      setSuccess(
        "Votre compte a été créé avec succès. Redirection vers la connexion..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      console.error("Erreur inscription :", error);

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(([field, message]) => {
              const text = Array.isArray(message)
                ? message.join(" ")
                : String(message);

              return `${field} : ${text}`;
            })
            .join("\n");

          setError(
            messages || "Impossible de créer le compte."
          );
        } else {
          setError(String(data));
        }
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
    <div className="register-page">

      <div className="register-background-shape register-shape-one" />
      <div className="register-background-shape register-shape-two" />

      <div className="register-card">

        <div className="register-header">
          <div className="register-logo">
            GS
          </div>

          <div>
            <h1>Créer votre compte</h1>

            <p>
              Rejoignez la plateforme de gestion des stages
            </p>
          </div>
        </div>

        <div className="register-divider" />

        <form onSubmit={handleSubmit}>

          <div className="form-section">
            <h2>Informations personnelles</h2>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="first_name">
                  Prénom
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="last_name">
                  Nom
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="username">
                  Nom d'utilisateur
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choisissez un identifiant"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">
                  Adresse email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h2>Coordonnées et profil</h2>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="telephone">
                  Téléphone
                </label>

                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="0341234567"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  autoComplete="tel"
                />

                <small>
                  10 chiffres maximum
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="role">
                  Type de compte
                </label>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="ETUDIANT">
                    Étudiant
                  </option>

                  <option value="ENSEIGNANT">
                    Enseignant
                  </option>

                  <option value="ENTREPRISE">
                    Entreprise
                  </option>
                </select>
              </div>

            </div>
          </div>

          <div className="form-section">
            <h2>Sécurité du compte</h2>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="password">
                  Mot de passe
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password_confirm">
                  Confirmation
                </label>

                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

            </div>
          </div>

          {error && (
            <div className="register-message register-error">
              <strong>Erreur</strong>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="register-message register-success">
              <strong>Inscription réussie</strong>
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Création du compte..."
              : "Créer mon compte"}
          </button>

        </form>

        <div className="register-footer">
          Vous avez déjà un compte ?

          <Link to="/login">
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;