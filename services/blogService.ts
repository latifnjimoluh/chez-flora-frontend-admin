import api from "./apis"

export const blogService = {
  // Récupérer tous les articles
  getAllPosts: async () => {
    try {
      const response = await api.get("/api/admin/blog")
      return response.data
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des articles",
      }
    }
  },

  // Récupérer un article par son ID
  getPostById: async (id: number) => {
    try {
      const response = await api.get(`/api/admin/blog/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blog post ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération de l'article",
      }
    }
  },

  // Récupérer un article par son slug
  getPostBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/api/admin/blog/slug/${slug}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération de l'article",
      }
    }
  },

  // Créer un nouvel article
  createPost: async (postData: any) => {
    try {
      const formData = new FormData()

      // Ajouter les champs texte
      formData.append("title", postData.title)
      if (postData.excerpt) formData.append("excerpt", postData.excerpt)
      formData.append("content", postData.content)
      formData.append("author", postData.author)
      formData.append("category", postData.category)
      formData.append("tags", JSON.stringify(postData.tags))
      formData.append("readTime", postData.readTime)

      // Ajouter l'image si elle existe
      if (postData.image instanceof File) {
        formData.append("image", postData.image)
      } else if (typeof postData.image === "string") {
        formData.append("imageUrl", postData.image)
      }

      const response = await api.post("/api/admin/blog", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Error creating blog post:", error)
      return {
        success: false,
        message: "Erreur lors de la création de l'article",
      }
    }
  },

  // Mettre à jour un article
  updatePost: async (id: number, postData: any) => {
    try {
      const formData = new FormData()

      // Ajouter les champs texte
      if (postData.title) formData.append("title", postData.title)
      if (postData.excerpt !== undefined) formData.append("excerpt", postData.excerpt)
      if (postData.content) formData.append("content", postData.content)
      if (postData.author) formData.append("author", postData.author)
      if (postData.category) formData.append("category", postData.category)
      if (postData.tags) formData.append("tags", JSON.stringify(postData.tags))
      if (postData.readTime) formData.append("readTime", postData.readTime)

      // Ajouter l'image si elle existe
      if (postData.image instanceof File) {
        formData.append("image", postData.image)
      } else if (typeof postData.image === "string" && postData.image.startsWith("http")) {
        formData.append("imageUrl", postData.image)
      }

      const response = await api.put(`/api/admin/blog/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error(`Error updating blog post ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour de l'article",
      }
    }
  },

  // Supprimer un article
  deletePost: async (id: number) => {
    try {
      const response = await api.delete(`/api/admin/blog/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting blog post ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de la suppression de l'article",
      }
    }
  },

  // Incrémenter les likes d'un article
  incrementLikes: async (id: number) => {
    try {
      const response = await api.patch(`/api/admin/blog/${id}/like`)
      return response.data
    } catch (error) {
      console.error(`Error incrementing likes for blog post ${id}:`, error)
      return {
        success: false,
        message: "Erreur lors de l'incrémentation des likes",
      }
    }
  },
}

