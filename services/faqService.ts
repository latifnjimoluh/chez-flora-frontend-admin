import api from "./apis"

export interface FAQ {
  id?: number
  question: string
  answer: string
  category: string
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

const faqService = {
  // Get all FAQs
  getAllFaqs: async (): Promise<FAQ[]> => {
    try {
      const response = await api.get("/api/admin/faqs")
      return response.data
    } catch (error: any) {
      console.error("Error fetching FAQs:", error)
      throw error.response?.data || { message: "Failed to fetch FAQs" }
    }
  },

  // Get FAQ by ID
  getFaqById: async (id: number): Promise<FAQ> => {
    try {
      const response = await api.get(`/api/admin/faqs/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching FAQ with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch FAQ" }
    }
  },

  // Create new FAQ
  createFaq: async (faqData: FAQ): Promise<FAQ> => {
    try {
      const response = await api.post("/api/admin/faqs", faqData)
      return response.data
    } catch (error: any) {
      console.error("Error creating FAQ:", error)
      throw error.response?.data || { message: "Failed to create FAQ" }
    }
  },

  // Update FAQ
  updateFaq: async (id: number, faqData: Partial<FAQ>): Promise<FAQ> => {
    try {
      const response = await api.put(`/api/admin/faqs/${id}`, faqData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating FAQ with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update FAQ" }
    }
  },

  // Delete FAQ
  deleteFaq: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/faqs/${id}`)
    } catch (error: any) {
      console.error(`Error deleting FAQ with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete FAQ" }
    }
  },

  // Toggle FAQ active status
  toggleFaqStatus: async (id: number, isActive: boolean): Promise<FAQ> => {
    try {
      const response = await api.patch(`/api/admin/faqs/${id}/status`, { is_active: isActive })
      return response.data
    } catch (error: any) {
      console.error(`Error toggling FAQ status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to toggle FAQ status" }
    }
  },

  // Update FAQ display order
  updateFaqOrder: async (id: number, displayOrder: number): Promise<FAQ> => {
    try {
      const response = await api.patch(`/api/admin/faqs/${id}/order`, { display_order: displayOrder })
      return response.data
    } catch (error: any) {
      console.error(`Error updating FAQ order with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update FAQ order" }
    }
  },
}

export default faqService

