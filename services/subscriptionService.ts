import api from "./apis"

export interface SubscriptionType {
  id?: number
  nom: string
  description: string
  prix: number
  frequence: string
  duree_engagement: number
  image_url?: string
  est_populaire?: boolean
  est_actif?: boolean
  date_creation?: string
  date_modification?: string
  caracteristiques?: SubscriptionFeature[]
}

export interface SubscriptionFeature {
  id?: number
  type_abonnement_id: number
  description: string
}

export interface Subscription {
  id_abonnement?: number
  id_client: number
  type_abonnement: string
  frequence: string
  adresse_livraison?: string
  disponibilites?: string
  dates_ateliers?: string
  date_souscription?: string
  date_echeance?: string
  statut: "abonné" | "résilié" | "suspendu"
  client?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

const subscriptionService = {
  // Subscription Types
  getAllSubscriptionTypes: async (): Promise<SubscriptionType[]> => {
    try {
      const response = await api.get("/api/admin/subscriptions/types")
      return response.data
    } catch (error: any) {
      console.error("Error fetching subscription types:", error)
      throw error.response?.data || { message: "Failed to fetch subscription types" }
    }
  },

  getSubscriptionTypeById: async (id: number): Promise<SubscriptionType> => {
    try {
      const response = await api.get(`/api/admin/subscriptions/types/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching subscription type with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch subscription type" }
    }
  },

  createSubscriptionType: async (typeData: SubscriptionType): Promise<SubscriptionType> => {
    try {
      const response = await api.post("/api/admin/subscriptions/types", typeData)
      return response.data
    } catch (error: any) {
      console.error("Error creating subscription type:", error)
      throw error.response?.data || { message: "Failed to create subscription type" }
    }
  },

  updateSubscriptionType: async (id: number, typeData: Partial<SubscriptionType>): Promise<SubscriptionType> => {
    try {
      const response = await api.put(`/api/admin/subscriptions/types/${id}`, typeData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating subscription type with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update subscription type" }
    }
  },

  deleteSubscriptionType: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/subscriptions/types/${id}`)
    } catch (error: any) {
      console.error(`Error deleting subscription type with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete subscription type" }
    }
  },

  toggleSubscriptionTypeStatus: async (id: number, isActive: boolean): Promise<SubscriptionType> => {
    try {
      const response = await api.patch(`/api/admin/subscriptions/types/${id}/status`, { est_actif: isActive })
      return response.data
    } catch (error: any) {
      console.error(`Error toggling subscription type status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to toggle subscription type status" }
    }
  },

  toggleSubscriptionTypePopular: async (id: number, isPopular: boolean): Promise<SubscriptionType> => {
    try {
      const response = await api.patch(`/api/admin/subscriptions/types/${id}/popular`, { est_populaire: isPopular })
      return response.data
    } catch (error: any) {
      console.error(`Error toggling subscription type popular status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to toggle subscription type popular status" }
    }
  },

  // Subscription Features
  getFeaturesByTypeId: async (typeId: number): Promise<SubscriptionFeature[]> => {
    try {
      const response = await api.get(`/api/admin/subscriptions/types/${typeId}/features`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching features for subscription type ID ${typeId}:`, error)
      throw error.response?.data || { message: "Failed to fetch subscription features" }
    }
  },

  addFeature: async (feature: SubscriptionFeature): Promise<SubscriptionFeature> => {
    try {
      const response = await api.post("/api/admin/subscriptions/features", feature)
      return response.data
    } catch (error: any) {
      console.error("Error adding subscription feature:", error)
      throw error.response?.data || { message: "Failed to add subscription feature" }
    }
  },

  updateFeature: async (id: number, description: string): Promise<SubscriptionFeature> => {
    try {
      const response = await api.put(`/api/admin/subscriptions/features/${id}`, { description })
      return response.data
    } catch (error: any) {
      console.error(`Error updating subscription feature with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update subscription feature" }
    }
  },

  deleteFeature: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/subscriptions/features/${id}`)
    } catch (error: any) {
      console.error(`Error deleting subscription feature with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete subscription feature" }
    }
  },

  // Subscriptions
  getAllSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await api.get("/api/admin/subscriptions")
      return response.data
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error)
      throw error.response?.data || { message: "Failed to fetch subscriptions" }
    }
  },

  getSubscriptionById: async (id: number): Promise<Subscription> => {
    try {
      const response = await api.get(`/api/admin/subscriptions/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching subscription with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch subscription" }
    }
  },

  createSubscription: async (subscriptionData: Subscription): Promise<Subscription> => {
    try {
      const response = await api.post("/api/admin/subscriptions", subscriptionData)
      return response.data
    } catch (error: any) {
      console.error("Error creating subscription:", error)
      throw error.response?.data || { message: "Failed to create subscription" }
    }
  },

  updateSubscription: async (id: number, subscriptionData: Partial<Subscription>): Promise<Subscription> => {
    try {
      const response = await api.put(`/api/admin/subscriptions/${id}`, subscriptionData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating subscription with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update subscription" }
    }
  },

  updateSubscriptionStatus: async (id: number, status: "abonné" | "résilié" | "suspendu"): Promise<Subscription> => {
    try {
      const response = await api.patch(`/api/admin/subscriptions/${id}/status`, { statut: status })
      return response.data
    } catch (error: any) {
      console.error(`Error updating subscription status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update subscription status" }
    }
  },

  deleteSubscription: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/subscriptions/${id}`)
    } catch (error: any) {
      console.error(`Error deleting subscription with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete subscription" }
    }
  },

  getSubscriptionsByClientId: async (clientId: number): Promise<Subscription[]> => {
    try {
      const response = await api.get(`/api/admin/subscriptions/client/${clientId}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching subscriptions for client ID ${clientId}:`, error)
      throw error.response?.data || { message: "Failed to fetch client subscriptions" }
    }
  },
}

export default subscriptionService

