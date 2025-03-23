import api from "./apis"

export interface ContactSubject {
  id?: number
  value: string
  label: string
  display_order?: number
  created_at?: string
  updated_at?: string
}

export interface ContactMessage {
  id?: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  created_at?: string
  updated_at?: string
}

export interface ContactInfo {
  id?: number
  type: string
  value: string
  icon?: string
  display_order?: number
  created_at?: string
  updated_at?: string
}

export interface MessageReply {
  message_id: number
  reply_text: string
  reply_subject?: string
}

const contactService = {
  // Contact Subjects
  getAllSubjects: async (): Promise<ContactSubject[]> => {
    try {
      const response = await api.get("/api/admin/contact-subjects")
      return response.data
    } catch (error: any) {
      console.error("Error fetching contact subjects:", error)
      throw error.response?.data || { message: "Failed to fetch contact subjects" }
    }
  },

  getSubjectById: async (id: number): Promise<ContactSubject> => {
    try {
      const response = await api.get(`/api/admin/contact-subjects/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching contact subject with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch contact subject" }
    }
  },

  createSubject: async (subjectData: ContactSubject): Promise<ContactSubject> => {
    try {
      const response = await api.post("/api/admin/contact-subjects", subjectData)
      return response.data
    } catch (error: any) {
      console.error("Error creating contact subject:", error)
      throw error.response?.data || { message: "Failed to create contact subject" }
    }
  },

  updateSubject: async (id: number, subjectData: Partial<ContactSubject>): Promise<ContactSubject> => {
    try {
      const response = await api.put(`/api/admin/contact-subjects/${id}`, subjectData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating contact subject with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update contact subject" }
    }
  },

  deleteSubject: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/contact-subjects/${id}`)
    } catch (error: any) {
      console.error(`Error deleting contact subject with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete contact subject" }
    }
  },

  // Contact Messages
  getAllMessages: async (): Promise<ContactMessage[]> => {
    try {
      const response = await api.get("/api/admin/contact-messages")
      return response.data
    } catch (error: any) {
      console.error("Error fetching contact messages:", error)
      throw error.response?.data || { message: "Failed to fetch contact messages" }
    }
  },

  getMessageById: async (id: number): Promise<ContactMessage> => {
    try {
      const response = await api.get(`/api/admin/contact-messages/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching contact message with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch contact message" }
    }
  },

  updateMessageStatus: async (id: number, status: "new" | "read" | "replied" | "archived"): Promise<ContactMessage> => {
    try {
      const response = await api.patch(`/api/admin/contact-messages/${id}/status`, { status })
      return response.data
    } catch (error: any) {
      console.error(`Error updating message status with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update message status" }
    }
  },

  replyToMessage: async (replyData: MessageReply): Promise<any> => {
    try {
      const response = await api.post("/api/admin/contact-messages/reply", replyData)
      return response.data
    } catch (error: any) {
      console.error("Error replying to message:", error)
      throw error.response?.data || { message: "Failed to reply to message" }
    }
  },

  deleteMessage: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/contact-messages/${id}`)
    } catch (error: any) {
      console.error(`Error deleting contact message with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete contact message" }
    }
  },

  // Contact Info
  getAllContactInfo: async (): Promise<ContactInfo[]> => {
    try {
      const response = await api.get("/api/admin/contact")
      return response.data
    } catch (error: any) {
      console.error("Error fetching contact info:", error)
      throw error.response?.data || { message: "Failed to fetch contact info" }
    }
  },

  getContactInfoById: async (id: number): Promise<ContactInfo> => {
    try {
      const response = await api.get(`/api/admin/contact/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching contact info with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch contact info" }
    }
  },

  createContactInfo: async (infoData: ContactInfo): Promise<ContactInfo> => {
    try {
      const response = await api.post("/api/admin/contact", infoData)
      return response.data
    } catch (error: any) {
      console.error("Error creating contact info:", error)
      throw error.response?.data || { message: "Failed to create contact info" }
    }
  },

  updateContactInfo: async (id: number, infoData: Partial<ContactInfo>): Promise<ContactInfo> => {
    try {
      const response = await api.put(`/api/admin/contact/${id}`, infoData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating contact info with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update contact info" }
    }
  },

  deleteContactInfo: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/admin/contact/${id}`)
    } catch (error: any) {
      console.error(`Error deleting contact info with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete contact info" }
    }
  },
}

export default contactService

