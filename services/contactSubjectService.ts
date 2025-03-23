import api from "./apis"

export const contactSubjectService = {
  // Récupérer tous les sujets de contact
  getAllSubjects: async () => {
    try {
      const response = await api.get("/api/admin/contact/subjects")
      
      // On enveloppe la réponse brutale dans un format normalisé
      return {
        success: true,
        data: response.data, // data ici est directement le tableau
      }
    } catch (error) {
      console.error("Error fetching contact info:", error)
      return { success: false, data: [], message: "Failed to fetch contact info" }
    }
  },

  // Récupérer un sujet de contact par son ID
  getSubjectById: async (id: number) => {
    try {
      const response = await api.get(`/api/admin/contact/subjects/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contact subject ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du sujet de contact",
      }
    }
  },

  // Créer un nouveau sujet de contact
  createSubject: async (subjectData: any) => {
    try {
      const response = await api.post("/api/admin/contact/subjects", subjectData)
      return response.data
    } catch (error) {
      console.error("Error creating contact subject:", error)
      return {
        success: false,
        message: "Erreur lors de la création du sujet de contact",
      }
    }
  },

  // Mettre à jour un sujet de contact
  updateSubject: async (id: number, subjectData: any) => {
    try {
      const response = await api.put(`/api/admin/contact/subjects/${id}`, subjectData)
      return response.data
    } catch (error) {
      console.error(`Error updating contact subject ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du sujet de contact",
      }
    }
  },

  // Supprimer un sujet de contact
  deleteSubject: async (id: number) => {
    try {
      const response = await api.delete(`/api/admin/contact/subjects/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting contact subject ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la suppression du sujet de contact",
      }
    }
  },

  // Réorganiser les sujets de contact
  reorderSubjects: async (orders: { id: number; display_order: number }[]) => {
    try {
      const response = await api.post("/api/admin/contact/subjects/reorder", { orders })
      return response.data
    } catch (error) {
      console.error("Error reordering contact subjects:", error)
      return {
        success: false,
        message: "Erreur lors de la réorganisation des sujets de contact",
      }
    }
  },
}

