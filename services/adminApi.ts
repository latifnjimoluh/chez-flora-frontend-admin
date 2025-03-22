import axios from "axios"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"


// Fonction utilitaire pour récupérer le token
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Fonction utilitaire pour définir le token
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

// Fonction utilitaire pour supprimer le token
export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const adminApi = axios.create({
  baseURL: `${apiUrl}/api/admin`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
adminApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Ajouter un intercepteur pour gérer les réponses
adminApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("Erreur API Admin:", error.message || "Erreur inconnue")

    // Gérer les erreurs réseau
    if (error.message === "Network Error") {
      console.error("Erreur réseau - Vérifiez votre connexion ou si le serveur est en cours d'exécution")
    }

    // Gérer les timeouts
    if (error.code === "ECONNABORTED") {
      console.error("La requête a expiré - Le serveur ne répond pas dans le délai imparti")
    }

    return Promise.reject(error)
  },
)

// ==================== AUTHENTIFICATION ADMIN ====================

// Fonction pour la connexion admin
export const loginAdmin = async (email: string, password: string): Promise<any> => {
  try {
    const response = await axios.post(`${apiUrl}/api/admin/login`, {
      email,
      password,
    })

    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la connexion admin", error)
    throw error.response?.data || { message: "Identifiants incorrects." }
  }
}

// ==================== GESTION DES UTILISATEURS ====================

// Fonction pour récupérer tous les utilisateurs
export const getAllUsers = async (): Promise<any> => {
  try {
    const response = await adminApi.get("/users")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des utilisateurs", error)
    throw error.response?.data || { message: "Impossible de récupérer les utilisateurs." }
  }
}

// Fonction pour récupérer tous les clients
export const getAllClients = async (): Promise<any> => {
  try {
    const response = await adminApi.get("/users/clients")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des clients", error)
    throw error.response?.data || { message: "Impossible de récupérer les clients." }
  }
}

// Fonction pour récupérer tous les administrateurs
export const getAllAdmins = async (): Promise<any> => {
  try {
    const response = await adminApi.get("/users/admins")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des administrateurs", error)
    throw error.response?.data || { message: "Impossible de récupérer les administrateurs." }
  }
}

// Fonction pour récupérer un utilisateur par son ID
export const getUserById = async (id: number): Promise<any> => {
  try {
    const response = await adminApi.get(`/users/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'utilisateur", error)
    throw error.response?.data || { message: "Impossible de récupérer l'utilisateur." }
  }
}

// Fonction pour créer un nouvel utilisateur
export const createUser = async (userData: {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: "client" | "admin" | "superadmin"
  status?: "verification" | "active" | "blocked" | "deleted"
}): Promise<any> => {
  try {
    const response = await adminApi.post("/users", userData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur", error)
    throw error.response?.data || { message: "Impossible de créer l'utilisateur." }
  }
}

// Fonction pour mettre à jour un utilisateur
export const updateUser = async (
  id: number,
  userData: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    password?: string
    role?: "client" | "admin" | "superadmin"
    status?: "verification" | "active" | "blocked" | "deleted"
  },
): Promise<any> => {
  try {
    const response = await adminApi.put(`/users/${id}`, userData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'utilisateur", error)
    throw error.response?.data || { message: "Impossible de mettre à jour l'utilisateur." }
  }
}

// Fonction pour supprimer un utilisateur
export const deleteUser = async (id: number): Promise<any> => {
  try {
    const response = await adminApi.delete(`/users/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur", error)
    throw error.response?.data || { message: "Impossible de supprimer l'utilisateur." }
  }
}

// Fonction pour changer le statut d'un utilisateur
export const toggleUserStatus = async (
  id: number,
  status: "verification" | "active" | "blocked" | "deleted",
): Promise<any> => {
  try {
    const response = await adminApi.put(`/users/${id}/status`, { status })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors du changement de statut de l'utilisateur", error)
    throw error.response?.data || { message: "Impossible de changer le statut de l'utilisateur." }
  }
}

// Fonction pour rechercher des utilisateurs
export const searchUsers = async (params: {
  search?: string
  status?: "verification" | "active" | "blocked" | "deleted"
  role?: "client" | "admin" | "superadmin"
  startDate?: string
  endDate?: string
}): Promise<any> => {
  try {
    const response = await adminApi.get("/users/search", { params })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la recherche des utilisateurs", error)
    throw error.response?.data || { message: "Impossible de rechercher les utilisateurs." }
  }
}

export default {
  loginAdmin,
  getAllUsers,
  getAllClients,
  getAllAdmins,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  searchUsers,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
}

