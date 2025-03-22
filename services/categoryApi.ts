import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const categoryApi = axios.create({
  baseURL: `${apiUrl}/api/admin/categories`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
categoryApi.interceptors.request.use(
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

// Récupérer toutes les catégories
export const getAllCategories = async (): Promise<any> => {
  try {
    const response = await categoryApi.get("/")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des catégories", error)
    throw error.response?.data || { message: "Impossible de récupérer les catégories." }
  }
}

// Récupérer une catégorie par son ID
export const getCategoryById = async (id: number): Promise<any> => {
  try {
    const response = await categoryApi.get(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la catégorie", error)
    throw error.response?.data || { message: "Impossible de récupérer la catégorie." }
  }
}

// Créer une nouvelle catégorie
export const createCategory = async (categoryData: {
  nom: string
  description: string | null
}): Promise<any> => {
  try {
    const response = await categoryApi.post("/", categoryData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la création de la catégorie", error)
    throw error.response?.data || { message: "Impossible de créer la catégorie." }
  }
}

// Mettre à jour une catégorie
export const updateCategory = async (
  id: number,
  categoryData: {
    nom?: string
    description?: string | null
  },
): Promise<any> => {
  try {
    const response = await categoryApi.put(`/${id}`, categoryData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la catégorie", error)
    throw error.response?.data || { message: "Impossible de mettre à jour la catégorie." }
  }
}

// Supprimer une catégorie
export const deleteCategory = async (id: number): Promise<any> => {
  try {
    const response = await categoryApi.delete(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la catégorie", error)
    throw error.response?.data || { message: "Impossible de supprimer la catégorie." }
  }
}

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
