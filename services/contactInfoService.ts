import api from "./apis"

export interface ContactInfo {
  id: number
  type: string
  value: string
  icon: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ContactInfoResponse {
  success: boolean
  data: ContactInfo | ContactInfo[]
  message?: string
}

export const contactInfoService = {
  getAllContactInfo: async (): Promise<ContactInfoResponse> => {
    try {
      const response = await api.get("/admin/contact-info")
      return response.data
    } catch (error) {
      console.error("Error fetching contact info:", error)
      return { success: false, data: [], message: "Failed to fetch contact info" }
    }
  },

  getContactInfoById: async (id: number): Promise<ContactInfoResponse> => {
    try {
      const response = await api.get(`/admin/contact-info/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contact info with id ${id}:`, error)
      return { success: false, data: {} as ContactInfo, message: "Failed to fetch contact info" }
    }
  },

  createContactInfo: async (contactInfoData: Partial<ContactInfo>): Promise<ContactInfoResponse> => {
    try {
      const response = await api.post("/admin/contact-info", contactInfoData)
      return response.data
    } catch (error) {
      console.error("Error creating contact info:", error)
      return { success: false, data: {} as ContactInfo, message: "Failed to create contact info" }
    }
  },

  updateContactInfo: async (id: number, contactInfoData: Partial<ContactInfo>): Promise<ContactInfoResponse> => {
    try {
      const response = await api.put(`/admin/contact-info/${id}`, contactInfoData)
      return response.data
    } catch (error) {
      console.error(`Error updating contact info with id ${id}:`, error)
      return { success: false, data: {} as ContactInfo, message: "Failed to update contact info" }
    }
  },

  deleteContactInfo: async (id: number): Promise<ContactInfoResponse> => {
    try {
      const response = await api.delete(`/admin/contact-info/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting contact info with id ${id}:`, error)
      return { success: false, data: {} as ContactInfo, message: "Failed to delete contact info" }
    }
  },

  updateDisplayOrder: async (id: number, direction: "up" | "down"): Promise<ContactInfoResponse> => {
    try {
      const response = await api.patch(`/admin/contact-info/${id}/display-order`, { direction })
      return response.data
    } catch (error) {
      console.error(`Error updating display order for contact info with id ${id}:`, error)
      return { success: false, data: {} as ContactInfo, message: "Failed to update display order" }
    }
  },
}

