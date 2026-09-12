import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Bell, 
  ClipboardList, 
  LogOut, 
  Check, 
  AlertCircle 
} from "lucide-react";

import api from "../services/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  /* =========================
      CHARGEMENT NOTIFICATIONS
  ========================= */

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get("notifications/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setNotifications(data);
    } catch (error) {
      console.error("Erreur notifications :", error);
    }
  };

  /* =========================
      DETERMINER LA PAGE
  ========================= */

  const getNotificationPath = (notification) => {
    switch (notification.entity_type) {
      case "rapport":
        return "/rapports";
      case "candidature":
        return "/candidatures";
      case "entreprise":
        return "/entreprises";
      case "offre_stage":
        return "/stages";
      case "encadrement":
        return "/encadrements";
      case "journal":
        return "/journaux";
      case "evaluation":
        return "/evaluations";
      default:
        return "/history";
    }
  };

  /* =========================
      CLIQUER NOTIFICATION
  ========================= */

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await api.patch(`notifications/${notification.id}/read/`);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
        );
      }

      setShowNotifications(false);

      const path = getNotificationPath(notification);
      navigate(path);
    } catch (error) {
      console.error("Erreur ouverture notification :", error);
    }
  };

  /* =========================
      TOUT MARQUER COMME LU
  ========================= */

  const markAllAsRead = async () => {
    try {
      await api.patch("notifications/read-all/");

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error("Erreur notifications :", error);
    }
  };

  /* =========================
      DECONNEXION
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="navbar">
      {/* =========================
          GAUCHE
      ========================= */}
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-logo">GS</div>

          <div>
            <strong>Gestion des stages</strong>
            <span>Plateforme professionnelle</span>
          </div>
        </div>

        <nav className="navbar-links">
          <NavLink to="/dashboard">Dashboard</NavLink>

          {user?.role === "ADMIN" && (
            <NavLink to="/users">Utilisateurs</NavLink>
          )}
        </nav>
      </div>

      {/* =========================
          DROITE
      ========================= */}
      <div className="navbar-right">
        {/* =========================
            NOTIFICATIONS
        ========================= */}
        <div className="navbar-notification">
          <button
            className="navbar-icon-button"
            onClick={() =>
              setShowNotifications((previous) => !previous)
            }
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="navbar-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              {/* HEADER */}
              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>
                  <span>{unreadCount} non lue(s)</span>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="mark-all-button"
                  >
                    Tout lire
                  </button>
                )}
              </div>

              {/* LISTE */}
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <div>
                      <Bell size={28} />
                    </div>
                    <p>Aucune notification</p>
                    <span>Vous êtes à jour.</span>
                  </div>
                ) : (
                  notifications
                    .slice(0, 8)
                    .map((notification) => (
                      <button
                        key={notification.id}
                        className={`notification-item ${
                          notification.is_read
                            ? "notification-read"
                            : "notification-unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <div className="notification-item-icon">
                          {notification.is_read ? (
                            <Check size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                        </div>

                        <div className="notification-item-content">
                          <strong>{notification.title}</strong>

                          <p>{notification.message}</p>

                          <span>
                            {new Date(
                              notification.date_creation
                            ).toLocaleString("fr-FR")}
                          </span>
                        </div>
                      </button>
                    ))
                )}
              </div>

              {/* HISTORIQUE */}
              <button
                className="notification-history-button"
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/history");
                }}
              >
                Voir tout l'historique
              </button>
            </div>
          )}
        </div>

        {/* =========================
            HISTORIQUE
        ========================= */}
        <button
          className="navbar-history-button"
          onClick={() => navigate("/history")}
        >
          <ClipboardList size={18} />
          <span>Historique</span>
        </button>

        {/* =========================
            PROFIL
        ========================= */}
        <div className="navbar-profile">
          <div className="navbar-avatar">
            {(
              user?.first_name?.[0] ||
              user?.username?.[0] ||
              "U"
            ).toUpperCase()}
          </div>

          <div className="navbar-profile-info">
            <strong>{user?.username || "Utilisateur"}</strong>
            <span>{user?.role || ""}</span>
          </div>

          <button
            className="navbar-logout"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;