import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import History from "./pages/History";
import Entreprises from "./pages/Entreprises";
import Stages from "./pages/Stages";
import Candidatures from "./pages/Candidatures";
import Encadrements from "./pages/Encadrements";
import Journaux from "./pages/Journaux";
import Rapports from "./pages/Rapports";
import Evaluations from "./pages/Evaluations";

import DepotDemande from "./pages/DepotDemande";
import MesDemandes from "./pages/MesDemandes";

import Statistiques from "./pages/Statistiques";

import ValidationDemandes from "./pages/ValidationDemandes";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";

function App() {
  return (
    <Routes>

      {/* =========================
          ACCUEIL
      ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =========================
          CONNEXION
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =========================
          INSCRIPTION
      ========================= */}

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          DASHBOARD
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* =========================
          UTILISATEURS
      ========================= */}

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Users />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          ENTREPRISES
      ========================= */}

      <Route
        path="/entreprises"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Entreprises />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          STAGES
      ========================= */}

      <Route
        path="/stages"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Stages />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          CANDIDATURES
      ========================= */}

      <Route
        path="/candidatures"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Candidatures />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          DEPOT DEMANDE
      ========================= */}

      <Route
        path="/demandes/depot"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DepotDemande />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          MES DEMANDES
      ========================= */}

      <Route
        path="/demandes/mes-demandes"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <MesDemandes />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          VALIDATION
      ========================= */}

      <Route
        path="/demandes/validation"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ValidationDemandes />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          ENCADREMENTS
      ========================= */}

      <Route
        path="/encadrements"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Encadrements />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          JOURNAUX
      ========================= */}

      <Route
        path="/journaux"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Journaux />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          RAPPORTS
      ========================= */}

      <Route
        path="/rapports"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Rapports />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          EVALUATIONS
      ========================= */}

      <Route
        path="/evaluations"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Evaluations />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          STATISTIQUES
      ========================= */}

      <Route
        path="/statistiques"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Statistiques />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          HISTORIQUE
      ========================= */}

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <History />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          ROUTE INCONNUE
      ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;