import api from "./apis"

export const testimonialService = {
  // Récupérer tous les témoignages
  getAllTestimonials: async () => {
    try {
      const response = await api.get("/api/admin/testimonials")
      return response.data
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des témoignages",
      }
    }
  },

  // Récupérer les témoignages mis en avant
  getFeaturedTestimonials: async () => {
    try {
      const response = await api.get("/api/admin/testimonials/featured")
      return response.data
    } catch (error) {
      console.error("Error fetching featured testimonials:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des témoignages mis en avant",
      }
    }
  },

  // Récupérer un témoignage par son ID
  getTestimonialById: async (id: number) => {
    try {
      const response = await api.get(`/api/admin/testimonials/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching testimonial ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du témoignage",
      }
    }
  },

  // Créer un nouveau témoignage
  createTestimonial: async (testimonialData: any) => {
    try {
      const formData = new FormData()

      // Ajouter les champs texte
      formData.append("name", testimonialData.name)
      formData.append("text", testimonialData.text)
      formData.append("rating", testimonialData.rating)
      formData.append("is_featured", testimonialData.is_featured ? "1" : "0")

      // Ajouter l'image si elle existe
      if (testimonialData.image instanceof File) {
        formData.append("image", testimonialData.image)
      }

      const response = await api.post("/api/admin/testimonials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Error creating testimonial:", error)
      return {
        success: false,
        message: "Erreur lors de la création du témoignage",
      }
    }
  },

  // Mettre à jour un témoignage
  updateTestimonial: async (id: number, testimonialData: any) => {
    try {
      const formData = new FormData()

      // Ajouter les champs texte
      if (testimonialData.name) formData.append("name", testimonialData.name)
      if (testimonialData.text) formData.append("text", testimonialData.text)
      if (testimonialData.rating) formData.append("rating", testimonialData.rating)
      if (testimonialData.is_featured !== undefined) {
        formData.append("is_featured", testimonialData.is_featured ? "1" : "0")
      }
      if (testimonialData.display_order) {
        formData.append("display_order", testimonialData.display_order)
      }

      // Ajouter l'image si elle existe
      if (testimonialData.image instanceof File) {
        formData.append("image", testimonialData.image)
      }

      const response = await api.put(`/api/admin/testimonials/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error(`Error updating testimonial ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du témoignage",
      }
    }
  },

  // Supprimer un témoignage
  deleteTestimonial: async (id: number) => {
    try {
      const response = await api.delete(`/api/admin/testimonials/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting testimonial ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la suppression du témoignage",
      }
    }
  },

  // Basculer le statut "mis en avant" d'un témoignage
  toggleFeatured: async (id: number, isFeatured: boolean) => {
    try {
      const response = await api.patch(`/api/admin/testimonials/${id}/featured`, {
        is_featured: isFeatured,
      })
      return response.data
    } catch (error) {
      console.error(`Error toggling featured status for testimonial ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la modification du statut mis en avant",
      }
    }
  },
}

