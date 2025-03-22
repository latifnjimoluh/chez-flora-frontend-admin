import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const serviceApi = axios.create({
  baseURL: `${apiUrl}/api/admin/services`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
serviceApi.interceptors.request.use(
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

// Récupérer tous les services
export const getAllServices = async (): Promise<any> => {
  try {
    const response = await serviceApi.get("/")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des services", error)
    throw error.response?.data || { message: "Impossible de récupérer les services." }
  }
}

// Récupérer un service par son ID
export const getServiceById = async (id: string): Promise<any> => {
  try {
    const response = await serviceApi.get(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération du service", error)
    throw error.response?.data || { message: "Impossible de récupérer le service." }
  }
}

// Créer un nouveau service
export const createService = async (serviceData: {
  nom: string
  description: string
  categorie: "Mariage" | "Entreprise" | "Espaces commerciaux" | "Jardins"
  images: string[]
  tarification: string
  disponibilite?: boolean
  dimension?: string
  nb_personnes?: number
  lieu?: "intérieur" | "extérieur"
  mis_en_avant?: boolean
}): Promise<any> => {
  try {
    const response = await serviceApi.post("/", serviceData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la création du service", error)
    throw error.response?.data || { message: "Impossible de créer le service." }
  }
}

// Mettre à jour un service
export const updateService = async (
  id: string,
  serviceData: {
    nom?: string
    description?: string
    categorie?: "Mariage" | "Entreprise" | "Espaces commerciaux" | "Jardins"
    images?: string[]
    tarification?: string
    disponibilite?: boolean
    dimension?: string
    nb_personnes?: number
    lieu?: "intérieur" | "extérieur"
    mis_en_avant?: boolean
  },
): Promise<any> => {
  try {
    const response = await serviceApi.put(`/${id}`, serviceData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du service", error)
    throw error.response?.data || { message: "Impossible de mettre à jour le service." }
  }
}

// Supprimer un service
export const deleteService = async (id: string): Promise<any> => {
  try {
    const response = await serviceApi.delete(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la suppression du service", error)
    throw error.response?.data || { message: "Impossible de supprimer le service." }
  }
}

// Mettre à jour la disponibilité d'un service
export const updateServiceAvailability = async (
  id: string,
  available: boolean
): Promise<any> => {
  try {
    const response = await serviceApi.patch(`/${id}/availability`, { disponibilite: available })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la disponibilité du service", error)
    throw error.response?.data || { message: "Impossible de mettre à jour la disponibilité du service." }
  }
}

// Mettre à jour la mise en avant d'un service
export const updateServiceFeatured = async (
  id: string,
  featured: boolean
): Promise<any> => {
  try {
    const response = await serviceApi.patch(`/${id}/featured`, { mis_en_avant: featured })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la mise en avant du service", error)
    throw error.response?.data || { message: "Impossible de mettre à jour la mise en avant du service." }
  }
}

export default {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceAvailability,
  updateServiceFeatured
}
