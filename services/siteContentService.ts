import api from "./apis"

export const siteContentService = {
  // Récupérer tout le contenu du site
  getAllContent: async () => {
    try {
      const response = await api.get("/admin/site-content")
      return response.data
    } catch (error) {
      console.error("Error fetching site content:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération du contenu du site",
      }
    }
  },

  // Récupérer un contenu par sa clé
  getContentByKey: async (key: string) => {
    try {
      const response = await api.get(`/admin/site-content/${key}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching content for key ${key}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du contenu",
      }
    }
  },

  // Mettre à jour un contenu
  updateContent: async (key: string, contentData: any) => {
    try {
      // Si c'est une URL d'image et qu'un fichier est fourni
      if (key.includes("_url") && contentData.file instanceof File) {
        const formData = new FormData()
        formData.append("image", contentData.file)

        const response = await api.put(`/admin/site-content/${key}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        return response.data
      } else {
        // Pour les contenus texte
        const response = await api.put(`/admin/site-content/${key}`, {
          content_value: contentData.content_value,
        })

        return response.data
      }
    } catch (error) {
      console.error(`Error updating content for key ${key}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du contenu",
      }
    }
  },

  // Mettre à jour plusieurs contenus à la fois
  updateMultipleContent: async (contents: { content_key: string; content_value: string }[]) => {
    try {
      const response = await api.put("/admin/site-content", { contents })
      return response.data
    } catch (error) {
      console.error("Error updating multiple content items:", error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour des contenus",
      }
    }
  },
}

