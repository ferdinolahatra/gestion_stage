import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Users.css";

// Composant réutilisable pour les icônes SVG
const Icon = ({ name, className = "" }) => {
  switch (name) {
    case "plus":
      return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
    case "users":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case "check":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
    case "student":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      );
    case "teacher":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    case "company":
      return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="6" x2="9" y2="6.01"></line>
          <line x1="15" y1="6" x2="15" y2="6.01"></line>
          <line x1="9" y1="10" x2="9" y2="10.01"></line>
          <line x1="15" y1="10" x2="15" y2="10.01"></line>
          <line x1="9" y1="14" x2="9" y2="14.01"></line>
          <line x1="15" y1="14" x2="15" y2="14.01"></line>
          <line x1="9" y1="18" x2="15" y2="18"></line>
        </svg>
      );
    case "search":
      return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      );
    case "refresh":
      return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      );
    case "alert":
      return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    case "close":
      return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
    case "user":
      return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    default:
      return null;
  }
};

const EMPTY_FORM = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "ETUDIANT",
  telephone: "",
  password: "",
  is_active: true,
};

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [statusFilter, setStatusFilter] = useState("TOUS");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [toast, setToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("users/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setUsers(data);
    } catch (error) {
      console.error("Erreur utilisateurs :", error);

      if (error.response?.status === 401) {
        setError("Votre session a expiré.");
      } else if (error.response?.status === 403) {
        setError(
          "Accès réservé à l'administrateur."
        );
      } else {
        setError(
          "Impossible de charger les utilisateurs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (
    title,
    message,
    type = "success"
  ) => {
    setToast({
      visible: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setToast((previous) => ({
        ...previous,
        visible: false,
      }));
    }, 4000);
  };

  const roleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur";
      case "ETUDIANT":
        return "Étudiant";
      case "ENSEIGNANT":
        return "Enseignant";
      case "ENTREPRISE":
        return "Entreprise";
      default:
        return role;
    }
  };

  const roleClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "role-admin";
      case "ETUDIANT":
        return "role-student";
      case "ENSEIGNANT":
        return "role-teacher";
      case "ENTREPRISE":
        return "role-company";
      default:
        return "role-default";
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "TOUS" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "TOUS" ||
        (statusFilter === "ACTIF" && user.is_active) ||
        (statusFilter === "INACTIF" && !user.is_active);

      if (!matchesRole || !matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [
        user.username,
        user.email,
        user.first_name,
        user.last_name,
        user.telephone,
        roleLabel(user.role),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term)
        );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: users.length,

      active: users.filter(
        (user) => user.is_active
      ).length,

      students: users.filter(
        (user) => user.role === "ETUDIANT"
      ).length,

      teachers: users.filter(
        (user) => user.role === "ENSEIGNANT"
      ).length,

      companies: users.filter(
        (user) => user.role === "ENTREPRISE"
      ).length,

      admins: users.filter(
        (user) => user.role === "ADMIN"
      ).length,
    };
  }, [users]);

  const openAddModal = () => {
    setEditingUser(null);

    setFormData({
      ...EMPTY_FORM,
      password: "",
    });

    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role || "ETUDIANT",
      telephone: user.telephone || "",
      password: "",
      is_active: user.is_active,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type === "checkbox") {
      setFormData((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    if (name === "telephone") {
      setFormData((previous) => ({
        ...previous,
        telephone: value
          .replace(/\D/g, "")
          .slice(0, 15),
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
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        telephone: formData.telephone,
        is_active: formData.is_active,
      };

      if (!editingUser) {
        payload.password = formData.password;
      }

      if (editingUser) {
        const response = await api.put(
          `users/${editingUser.id}/`,
          payload
        );

        setUsers((previous) =>
          previous.map((user) =>
            user.id === editingUser.id
              ? response.data
              : user
          )
        );

        showToast(
          "Utilisateur modifié",
          `${formData.username} a été modifié avec succès.`
        );
      } else {
        const response = await api.post(
          "users/",
          payload
        );

        setUsers((previous) => [
          response.data,
          ...previous,
        ]);

        showToast(
          "Utilisateur ajouté",
          `${formData.username} a été créé avec succès.`
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Erreur utilisateur :",
        error
      );

      let message =
        "Impossible d'enregistrer l'utilisateur.";

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

      showToast(
        "Erreur",
        message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      showToast(
        "Action impossible",
        "Vous ne pouvez pas supprimer votre propre compte.",
        "error"
      );

      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${user.username}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);

      await api.delete(
        `users/${user.id}/`
      );

      setUsers((previous) =>
        previous.filter(
          (item) => item.id !== user.id
        )
      );

      showToast(
        "Utilisateur supprimé",
        `${user.username} a été supprimé.`
      );
    } catch (error) {
      console.error(
        "Erreur suppression utilisateur :",
        error
      );

      showToast(
        "Erreur",
        "Impossible de supprimer cet utilisateur.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      showToast(
        "Action impossible",
        "Vous ne pouvez pas désactiver votre propre compte.",
        "error"
      );

      return;
    }

    try {
      const response = await api.patch(
        `users/${user.id}/`,
        {
          is_active: !user.is_active,
        }
      );

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? response.data
            : item
        )
      );

      showToast(
        "Statut modifié",
        `${user.username} est maintenant ${
          response.data.is_active
            ? "actif"
            : "inactif"
        }.`
      );
    } catch (error) {
      console.error(
        "Erreur statut utilisateur :",
        error
      );

      showToast(
        "Erreur",
        "Impossible de modifier le statut.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="users-page-state">
        <div className="users-spinner" />
        <p>
          Chargement des utilisateurs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page-state users-error">
        <div className="users-state-icon">
          <Icon name="alert" />
        </div>

        <h2>
          Accès impossible
        </h2>

        <p>
          {error}
        </p>

        <button onClick={loadUsers}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="users-page">

      {toast.visible && (
        <div
          className={`users-toast users-toast-${toast.type}`}
        >
          <div className="users-toast-icon">
            {toast.type === "error" ? (
              <Icon name="alert" />
            ) : (
              <Icon name="check" />
            )}
          </div>

          <div>
            <strong>
              {toast.title}
            </strong>

            <p>
              {toast.message}
            </p>
          </div>

          <button
            onClick={() =>
              setToast((previous) => ({
                ...previous,
                visible: false,
              }))
            }
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <header className="users-header">

        <div>
          <div className="users-breadcrumb">
            Administration
            <span>/</span>
            Utilisateurs
          </div>

          <span className="users-kicker">
            ADMINISTRATION DES COMPTES
          </span>

          <h1>
            Gestion des utilisateurs
          </h1>

          <p>
            Gérez les comptes, les rôles et
            les accès de la plateforme.
          </p>
        </div>

        <button
          className="users-add-button"
          onClick={openAddModal}
        >
          <Icon name="plus" />
          <span>Ajouter un utilisateur</span>
        </button>

      </header>

      {/* =========================
          STATISTIQUES
      ========================= */}

      <section className="users-stats">

        <div className="users-stat-card">
          <div className="users-stat-icon total">
            <Icon name="users" />
          </div>

          <div>
            <span>Total</span>
            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon active">
            <Icon name="check" />
          </div>

          <div>
            <span>Actifs</span>
            <strong>
              {stats.active}
            </strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon student">
            <Icon name="student" />
          </div>

          <div>
            <span>Étudiants</span>
            <strong>
              {stats.students}
            </strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon teacher">
            <Icon name="teacher" />
          </div>

          <div>
            <span>Enseignants</span>
            <strong>
              {stats.teachers}
            </strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon company">
            <Icon name="company" />
          </div>

          <div>
            <span>Entreprises</span>
            <strong>
              {stats.companies}
            </strong>
          </div>
        </div>

      </section>

      {/* =========================
          FILTRES
      ========================= */}

      <section className="users-toolbar">

        <div className="users-search">
          <Icon name="search" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher par nom, email, téléphone..."
          />
        </div>

        <div className="users-filter-group">

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="TOUS">
              Tous les rôles
            </option>

            <option value="ADMIN">
              Administrateurs
            </option>

            <option value="ETUDIANT">
              Étudiants
            </option>

            <option value="ENSEIGNANT">
              Enseignants
            </option>

            <option value="ENTREPRISE">
              Entreprises
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="TOUS">
              Tous les statuts
            </option>

            <option value="ACTIF">
              Actifs
            </option>

            <option value="INACTIF">
              Inactifs
            </option>
          </select>

        </div>

      </section>

      {/* =========================
          TABLE
      ========================= */}

      <section className="users-card">

        <div className="users-card-header">

          <div>
            <h2>
              Comptes utilisateurs
            </h2>

            <p>
              {filteredUsers.length} utilisateur(s)
              affiché(s)
            </p>
          </div>

          <button
            className="users-refresh-button"
            onClick={loadUsers}
          >
            <Icon name="refresh" />
            <span>Actualiser</span>
          </button>

        </div>

        {filteredUsers.length === 0 ? (

          <div className="users-empty">

            <div className="users-empty-icon">
              <Icon name="user" />
            </div>

            <h3>
              Aucun utilisateur trouvé
            </h3>

            <p>
              Modifiez votre recherche ou créez
              un nouvel utilisateur.
            </p>

          </div>

        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Contact</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      <div className="user-identity">

                        <div className="user-avatar">
                          {(
                            user.first_name?.[0] ||
                            user.username?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.first_name ||
                            user.last_name
                              ? `${user.first_name || ""} ${
                                  user.last_name || ""
                                }`.trim()
                              : user.username}
                          </strong>

                          <span>
                            @{user.username}
                          </span>

                          <small>
                            {user.email}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span
                        className={`user-role ${roleClass(
                          user.role
                        )}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    <td>
                      <div className="user-contact">
                        <span>
                          {user.telephone ||
                            "Téléphone non renseigné"}
                        </span>

                        <small>
                          {user.email}
                        </small>
                      </div>
                    </td>

                    <td>
                      <button
                        className={`user-status ${
                          user.is_active
                            ? "status-active"
                            : "status-inactive"
                        }`}
                        onClick={() =>
                          toggleStatus(user)
                        }
                        disabled={
                          user.id === currentUser?.id
                        }
                      >
                        <span />
                        {user.is_active
                          ? "Actif"
                          : "Inactif"}
                      </button>
                    </td>

                    <td>
                      {user.date_creation
                        ? new Date(
                            user.date_creation
                          ).toLocaleDateString(
                            "fr-FR"
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="users-actions">

                        <button
                          className="user-edit-button"
                          onClick={() =>
                            openEditModal(user)
                          }
                        >
                          Modifier
                        </button>

                        <button
                          className="user-delete-button"
                          disabled={
                            deletingId === user.id ||
                            user.id === currentUser?.id
                          }
                          onClick={() =>
                            handleDelete(user)
                          }
                        >
                          {deletingId === user.id
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

      {/* =========================
          MODAL
      ========================= */}

      {showModal && (

        <div className="users-modal-overlay">

          <div className="users-modal">

            <div className="users-modal-header">

              <div>
                <span>
                  {editingUser
                    ? "MODIFICATION DU COMPTE"
                    : "NOUVEAU COMPTE"}
                </span>

                <h2>
                  {editingUser
                    ? "Modifier l'utilisateur"
                    : "Ajouter un utilisateur"}
                </h2>
              </div>

              <button
                className="users-modal-close"
                onClick={closeModal}
              >
                <Icon name="close" />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="users-form-grid">

                <div className="user-field">
                  <label>
                    Nom d'utilisateur
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="user-field">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="user-field">
                  <label>
                    Prénom
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="user-field">
                  <label>
                    Nom
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="user-field">
                  <label>
                    Rôle
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
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

                    <option value="ADMIN">
                      Administrateur
                    </option>
                  </select>
                </div>

                <div className="user-field">
                  <label>
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="0341234567"
                  />
                </div>

                {!editingUser && (
                  <div className="user-field user-field-full">
                    <label>
                      Mot de passe
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength="8"
                      required
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                )}

                <div className="user-field user-field-full">

                  <label className="user-checkbox-label">

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Compte actif
                    </span>

                  </label>

                </div>

              </div>

              <div className="users-modal-actions">

                <button
                  type="button"
                  className="users-cancel-button"
                  onClick={closeModal}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="users-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingUser
                    ? "Enregistrer les modifications"
                    : "Créer le compte"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;