import api from "./apis"

export const contactMessageService = {
  // Récupérer tous les messages de contact
  getAllMessages: async () => {
    try {
      const response = await api.get("/api/admin/contact/messages")
      return response.data
    } catch (error) {
      console.error("Error fetching contact messages:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des messages de contact",
      }
    }
  },

  // Récupérer un message de contact par son ID
  getMessageById: async (id: number) => {
    try {
      const response = await api.get(`/api/admin/contact/messages/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contact message ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du message de contact",
      }
    }
  },

  // Mettre à jour le statut d'un message
  updateMessageStatus: async (id: number, status: string) => {
    try {
      const response = await api.patch(`/api/admin/contact/messages/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating status for contact message ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du statut du message",
      }
    }
  },

  // Répondre à un message
  replyToMessage: async (id: number, replyText: string) => {
    try {
      const response = await api.post(`/api/admin/contact/messages/${id}/reply`, { reply_text: replyText })
      return response.data
    } catch (error) {
      console.error(`Error replying to contact message ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de l'envoi de la réponse",
      }
    }
  },

  // Supprimer un message
  deleteMessage: async (id: number) => {
    try {
      const response = await api.delete(`/api/admin/contact/messages/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting contact message ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la suppression du message",
      }
    }
  },
}

