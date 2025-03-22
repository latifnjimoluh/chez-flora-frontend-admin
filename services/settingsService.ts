import api from "./apis"

export const settingsService = {
  // Récupérer tous les paramètres
  getAllSettings: async () => {
    try {
      const response = await api.get("/admin/settings")
      return response.data
    } catch (error) {
      console.error("Error fetching settings:", error)
      return {
        success: false,
        message: "Erreur lors de la récupération des paramètres",
      }
    }
  },

  // Récupérer un paramètre par sa clé
  getSettingByKey: async (key: string) => {
    try {
      const response = await api.get(`/admin/settings/${key}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error)
      return {
        success: false,
        message: "Erreur lors de la récupération du paramètre",
      }
    }
  },

  // Mettre à jour un paramètre
  updateSetting: async (key: string, value: string) => {
    try {
      const response = await api.put(`/admin/settings/${key}`, { value })
      return response.data
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour du paramètre",
      }
    }
  },

  // Mettre à jour plusieurs paramètres à la fois
  updateMultipleSettings: async (settings: { key: string; value: string }[]) => {
    try {
      const response = await api.put("/admin/settings", { settings })
      return response.data
    } catch (error) {
      console.error("Error updating multiple settings:", error)
      return {
        success: false,
        message: "Erreur lors de la mise à jour des paramètres",
      }
    }
  },
}

