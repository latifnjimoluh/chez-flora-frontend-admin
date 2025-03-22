import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const discussionApi = axios.create({
  baseURL: `${apiUrl}/api/admin/discussions`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
discussionApi.interceptors.request.use(
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

// Types
export type Discussion = {
  id: number
  client_id: number
  service_id: string
  dimension: string
  nb_personnes: number
  lieu: "intérieur" | "extérieur"
  prix_propose: number
  reponse_admin: number | null
  statut: "réponse_client" | "réponse_admin" | "finalisé"
  date_evenement: string | null
  adresse: string | null
  details: string | null
  message_client: string | null
  date_creation: string
  client_name?: string
  service_name?: string
}

// Récupérer toutes les discussions
export const getAllDiscussions = async (): Promise<Discussion[]> => {
  try {
    const response = await discussionApi.get("/")
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des discussions", error)
    throw error.response?.data || { message: "Impossible de récupérer les discussions." }
  }
}

// Récupérer une discussion par son ID
export const getDiscussionById = async (id: number): Promise<Discussion> => {
  try {
    const response = await discussionApi.get(`/${id}`)
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la discussion", error)
    throw error.response?.data || { message: "Impossible de récupérer la discussion." }
  }
}

// Répondre à une discussion
export const respondToDiscussion = async (id: number, adminResponse: number): Promise<any> => {
  try {
    const response = await discussionApi.post(`/${id}/respond`, { reponse_admin: adminResponse })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la réponse", error)
    throw error.response?.data || { message: "Impossible d'envoyer la réponse." }
  }
}

// Finaliser une discussion
export const finalizeDiscussion = async (id: number): Promise<any> => {
  try {
    const response = await discussionApi.patch(`/${id}/finalize`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la finalisation de la discussion", error)
    throw error.response?.data || { message: "Impossible de finaliser la discussion." }
  }
}

export default {
  getAllDiscussions,
  getDiscussionById,
  respondToDiscussion,
  finalizeDiscussion
}
