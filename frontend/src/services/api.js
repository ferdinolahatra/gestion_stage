import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// INTERCEPTEUR REQUEST
// =========================================================

api.interceptors.request.use(
  (config) => {

    const publicRoutes = [
      "token/",
      "register/",
    ];

    const isPublicRoute =
      publicRoutes.some(
        (route) =>
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

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // -----------------------------------------------------
    // FORMDATA
    // -----------------------------------------------------

    if (
      config.data instanceof FormData
    ) {

      delete config.headers[
        "Content-Type"
      ];

      delete config.headers[
        "content-type"
      ];
    }

    return config;
  },

  (error) => {

    return Promise.reject(
      error
    );
  }
);

export default api;