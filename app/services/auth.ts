import { useFetch } from "#app";
import { user } from "#build/ui-pro";

// Types pour les réponses et requêtes
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  roles: string[];
}

// Interface pour la réponse exacte de l'API utilisateur
interface UserResponse {
  id: number;
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  tel: string;
  password: string; // Note: Ne pas stocker le mot de passe en clair dans une vraie application
  role: string;
  dateCreation: string; // Date ISO string
  dateSuppression: string | null; // Date ISO string ou null
  actif: boolean;
}

// Interface pour l'utilisateur stocké localement (sans mot de passe)
interface UserEssentials {
  id: number;
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  tel: string;
  role: string;
  dateCreation: string;
  dateSuppression: string | null;
  actif: boolean;
  specialite?: string;
  numeroOrdre?: string;
}

export const useAuth = () => {
  const baseUrl = "http://localhost:9000"; // URL de votre backend Spring Boot

  // Stocker le token et les rôles dans localStorage
  const setToken = (token: string, roles: string[]) => {
    if (import.meta.client) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_roles", JSON.stringify(roles));
    }
  };

  // Stocker l'utilisateur courant dans localStorage
  const setCurrentUser = (user: UserEssentials) => {
    if (import.meta.client) {
      localStorage.setItem("current_user", JSON.stringify(user));
    }
  };

  // Récupérer l'utilisateur courant depuis localStorage
  const getCurrentUser = (): UserEssentials | null => {
    if (import.meta.client) {
      const user = localStorage.getItem("current_user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  };

  // Récupérer le token depuis localStorage
  const getToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  // Récupérer les rôles depuis localStorage
  const getRoles = (): string[] => {
    if (import.meta.client) {
      return JSON.parse(localStorage.getItem("auth_roles") || "[]");
    }
    return [];
  };

  // Supprimer les données d'authentification du localStorage
  const removeToken = () => {
    if (import.meta.client) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_roles");
      localStorage.removeItem("current_user");
    }
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  // Fonction de connexion
  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await useFetch<LoginResponse>(
        `${baseUrl}/api/auth/login`,
        {
          method: "POST",
          body: { username, password } as LoginRequest,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error.value) {
        throw new Error("Échec de la connexion");
      }

      if (data.value?.token) {
        const token = data.value.token;
        setToken(token, data.value.roles);

        // Récupérer les données utilisateur
        try {
          const { data, error } = await useFetch<UserResponse>(
            `${baseUrl}/api/medical/utilisateur/${username}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // <-- Ajout du token ici
              },
            }
          );

          if (error.value) {
            throw new Error("Échec de la récupération des données utilisateur");
          }
          const userData = data.value;
          if (userData) {
            setCurrentUser(userData);
            console.log("[Auth] User successfully loaded:", userData);
          }
        } catch (err) {
          console.error("[Auth] Failed to fetch user details:", err);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await $fetch(`${baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Supprimer les données locales même si la déconnexion échoue côté serveur
      removeToken();
      // Rediriger vers la page de connexion
      navigateTo("/login");
    }
  };

  return {
    login,
    logout,
    getToken,
    getRoles,
    isAuthenticated,
    setCurrentUser,
    getCurrentUser,
  };
};
