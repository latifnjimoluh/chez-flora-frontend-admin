import api from "./apis"

export const blogCommentService = {
  // Récupérer tous les commentaires
  getAllComments: async () => {
    try {
      const response = await api.get("/admin/blog-comments")
      return response.data
    } catch (error) {
      console.error("Error fetching blog comments:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des commentaires",
      }
    }
  },

  // Récupérer un commentaire par son ID
  getCommentById: async (id: number) => {
    try {
      const response = await api.get(`/admin/blog-comments/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blog comment ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du commentaire",
      }
    }
  },

  // Récupérer les commentaires d'un article
  getCommentsByPostId: async (postId: number) => {
    try {
      const response = await api.get(`/admin/blog-comments/post/${postId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération des commentaires de l'article",
      }
    }
  },

  // Créer un nouveau commentaire
  createComment: async (commentData: any) => {
    try {
      const response = await api.post("/admin/blog-comments", commentData)
      return response.data
    } catch (error) {
      console.error("Error creating blog comment:", error)
      return {
        success: false,
        message: "Erreur lors de la création du commentaire",
      }
    }
  },

  // Mettre à jour un commentaire
  updateComment: async (id: number, commentData: any) => {
    try {
      const response = await api.put(`/admin/blog-comments/${id}`, commentData)
      return response.data
    } catch (error) {
      console.error(`Error updating blog comment ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du commentaire",
      }
    }
  },

  // Supprimer un commentaire
  deleteComment: async (id: number) => {
    try {
      const response = await api.delete(`/admin/blog-comments/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting blog comment ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la suppression du commentaire",
      }
    }
  },

  // Incrémenter les likes d'un commentaire
  incrementLikes: async (id: number) => {
    try {
      const response = await api.patch(`/admin/blog-comments/${id}/like`)
      return response.data
    } catch (error) {
      console.error(`Error incrementing likes for blog comment ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de l'incrémentation des likes",
      }
    }
  },
}

