import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  BriefcaseBusiness,
  FileText,
  Send,
  Inbox,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Star,
  History,
  CheckCircle,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

import "./Sidebar.css";


function Sidebar({ darkMode, setDarkMode }) {

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);


  /* =========================================
     UTILISATEUR CONNECTÉ
  ========================================= */

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  /* =========================================
     DÉCONNEXION
  ========================================= */

  const handleLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  /* =========================================
     CHANGEMENT DU MODE
  ========================================= */

  const handleThemeChange = () => {

    const currentDarkMode =
      document.body.classList.contains("dark-mode");

    const newDarkMode = !currentDarkMode;


    if (newDarkMode) {

      document.body.classList.add("dark-mode");

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.body.classList.remove("dark-mode");

      localStorage.setItem(
        "theme",
        "light"
      );

    }


    if (typeof setDarkMode === "function") {

      setDarkMode(newDarkMode);

    }


    window.dispatchEvent(
      new Event("themeChanged")
    );
  };


  /* =========================================
     ÉTAT RÉEL DU THÈME
  ========================================= */

  const isDarkMode =
    document.body.classList.contains("dark-mode");


  /* =========================================
     FERMER SIDEBAR
  ========================================= */

  const closeSidebar = () => {

    setSidebarOpen(false);

  };


  return (
    <>

      {/* =====================================
          BOUTON MOBILE
      ===================================== */}

      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() =>
          setSidebarOpen(true)
        }
        aria-label="Ouvrir le menu"
        title="Ouvrir le menu"
      >

        <Menu
          size={23}
          strokeWidth={2}
        />

      </button>


      {/* =====================================
          OVERLAY MOBILE
      ===================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}


      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >


        {/* =========================================
            HEADER SIDEBAR
        ========================================= */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            GS
          </div>


          <div className="sidebar-brand-text">

            <h2>
              Gestion des stages
            </h2>

            <span>
              Plateforme
            </span>

          </div>


          {/* FERMER SUR MOBILE */}

          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Fermer le menu"
            title="Fermer le menu"
          >

            <X
              size={21}
              strokeWidth={2}
            />

          </button>

        </div>


        {/* =========================================
            NAVIGATION
        ========================================= */}

        <nav className="sidebar-nav">


          {/* DASHBOARD */}

          <NavLink
            to="/dashboard"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <LayoutDashboard
              size={19}
              strokeWidth={2}
            />

            <span>
              Dashboard
            </span>

          </NavLink>


          {/* STATISTIQUES ADMIN */}

          {user?.role === "ADMIN" && (

            <NavLink
              to="/statistiques"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <BarChart3
                size={19}
                strokeWidth={2}
              />

              <span>
                Statistiques
              </span>

            </NavLink>

          )}


          {/* UTILISATEURS ADMIN */}

          {user?.role === "ADMIN" && (

            <NavLink
              to="/users"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <Users
                size={19}
                strokeWidth={2}
              />

              <span>
                Gestion des utilisateurs
              </span>

            </NavLink>

          )}


          {/* ENTREPRISES */}

          <NavLink
            to="/entreprises"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <Building2
              size={19}
              strokeWidth={2}
            />

            <span>
              Entreprises
            </span>

          </NavLink>


          {/* OFFRES */}

          <NavLink
            to="/stages"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <BriefcaseBusiness
              size={19}
              strokeWidth={2}
            />

            <span>
              Offres de stage
            </span>

          </NavLink>


          {/* CANDIDATURES */}

          <NavLink
            to="/candidatures"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <FileText
              size={19}
              strokeWidth={2}
            />

            <span>
              Candidatures
            </span>

          </NavLink>


          {/* VALIDATION ADMIN */}

          {user?.role === "ADMIN" && (

            <NavLink
              to="/demandes/validation"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <CheckCircle
                size={19}
                strokeWidth={2}
              />

              <span>
                Validation des demandes
              </span>

            </NavLink>

          )}


          {/* DÉPÔT ÉTUDIANT */}

          {user?.role === "ETUDIANT" && (

            <NavLink
              to="/demandes/depot"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <Send
                size={19}
                strokeWidth={2}
              />

              <span>
                Dépôt de demande
              </span>

            </NavLink>

          )}


          {/* MES DEMANDES */}

          {user?.role === "ETUDIANT" && (

            <NavLink
              to="/demandes/mes-demandes"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <Inbox
                size={19}
                strokeWidth={2}
              />

              <span>
                Mes demandes
              </span>

            </NavLink>

          )}


          {/* ENCADREMENTS */}

          <NavLink
            to="/encadrements"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <GraduationCap
              size={19}
              strokeWidth={2}
            />

            <span>
              Encadrements
            </span>

          </NavLink>


          {/* JOURNAUX */}

          <NavLink
            to="/journaux"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <BookOpen
              size={19}
              strokeWidth={2}
            />

            <span>
              Journaux
            </span>

          </NavLink>


          {/* RAPPORTS */}

          <NavLink
            to="/rapports"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <ClipboardList
              size={19}
              strokeWidth={2}
            />

            <span>
              Rapports
            </span>

          </NavLink>


          {/* ÉVALUATIONS */}

          <NavLink
            to="/evaluations"
            className="sidebar-link"
            onClick={closeSidebar}
          >

            <Star
              size={19}
              strokeWidth={2}
            />

            <span>
              Évaluations
            </span>

          </NavLink>


          {/* HISTORIQUE ADMIN */}

          {user?.role === "ADMIN" && (

            <NavLink
              to="/history"
              className="sidebar-link"
              onClick={closeSidebar}
            >

              <History
                size={19}
                strokeWidth={2}
              />

              <span>
                Historique
              </span>

            </NavLink>

          )}

        </nav>


        {/* =========================================
            BAS SIDEBAR
        ========================================= */}

        <div className="sidebar-bottom">


          {/* UTILISATEUR */}

          <div className="sidebar-user">

            <div className="sidebar-avatar">

              {user?.username
                ?.charAt(0)
                ?.toUpperCase() || "U"}

            </div>


            <div className="sidebar-user-info">

              <strong>
                {user?.username || "Utilisateur"}
              </strong>

              <span>
                {user?.role || ""}
              </span>

            </div>

          </div>


          {/* =========================================
              MODE CLAIR / NUIT
          ========================================= */}

          <button
            type="button"
            className="theme-button"
            onClick={handleThemeChange}
            title={
              isDarkMode
                ? "Activer le mode clair"
                : "Activer le mode nuit"
            }
          >

            {isDarkMode ? (

              <Sun
                size={18}
                strokeWidth={2}
              />

            ) : (

              <Moon
                size={18}
                strokeWidth={2}
              />

            )}

            <span>

              {isDarkMode
                ? "Mode clair"
                : "Mode nuit"}

            </span>

          </button>


          {/* =========================================
              DÉCONNEXION
          ========================================= */}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >

            <LogOut
              size={18}
              strokeWidth={2}
            />

            <span>
              Déconnexion
            </span>

          </button>


        </div>

      </aside>

    </>
  );
}


export default Sidebar;