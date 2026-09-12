import axios from "axios";

// Récupération de l'URL depuis les variables d'environnement Vite (.env)
// Si la variable n'est pas définie, utilise l'adresse locale
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// S'assure que la base URL se termine bien par un slash '/'
const formattedBaseURL = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

const api = axios.create({
  baseURL: formattedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// INTERCEPTEUR REQUEST
// =========================================================

api.interceptors.request.use(
  (config) => {
    const publicRoutes = ["token/", "register/"];

    const isPublicRoute = publicRoutes.some((route) =>
      config.url?.endsWith(route)
    );

    // -----------------------------------------------------
    // ROUTES PUBLIQUES
    // -----------------------------------------------------

    if (isPublicRoute) {
      delete config.headers.Authorization;
      return config;
    }

    // -----------------------------------------------------
    // TOKEN JWT
    // -----------------------------------------------------

    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // -----------------------------------------------------
    // FORMDATA
    // -----------------------------------------------------

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// INTERCEPTEUR RESPONSE
// =========================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error(
        "Erreur 403 : Le serveur refuse l'accès avec le compte/token actuel."
      );
    }
    return Promise.reject(error);
  }
);

export default api;