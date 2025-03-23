import api from "./apis"

export interface NewsletterSubscriber {
  id?: number
  email: string
  status: "active" | "unsubscribed"
  created_at?: string
  updated_at?: string
}

const newsletterService = {
  // Get all newsletter subscribers
  getAllSubscribers: async (): Promise<NewsletterSubscriber[]> => {
    try {
      const response = await api.get("/api/admin/newsletter-subscribers")
      return response.data
    } catch (error: any) {
      console.error("Error fetching newsletter subscribers:", error)
      throw error.response?.data || { message: "Failed to fetch newsletter subscribers" }
    }
  },

  // Get subscriber by ID
  getSubscriberById: async (id: number): Promise<NewsletterSubscriber> => {
    try {
      const response = await api.get(`/api/admin/newsletter-subscribers/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching subscriber with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch subscriber" }
    }
  },

  // Add new subscriber
  addSubscriber: async (email: string): Promise<NewsletterSubscriber> => {
    try {
      const response = await api.post("/api/admin/newsletter-subscribers", { email })
      return response.data
    } catch (error: any) {
      console.error("Error adding subscriber:", error)
      throw error.response?.data || { message: "Failed to add subscriber" }
    }
  },

  // Update subscriber status
  updateSubscriberStatus: async (id: number, status: "active" | "unsubscribed"): Promise<NewsletterSubscriber> => {
    try {
      const response = await api.patch(`/api/admin/newsletter-subscribers/${id}/status`, { status })
      return response.data
    } catch (error: any) {
      console.error(`Error updating subscriber status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update subscriber status" }
    }
  },

  // Delete subscriber
  deleteSubscriber: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/newsletter-subscribers/${id}`)
    } catch (error: any) {
      console.error(`Error deleting subscriber with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete subscriber" }
    }
  },
}

export default newsletterService

