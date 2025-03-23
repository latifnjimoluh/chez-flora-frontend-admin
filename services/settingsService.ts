import api from "./apis"

export interface Setting {
  key: string
  value: string
}

export const settingsService = {
  getAllSettings: async () => {
    try {
      const response = await api.get("/api/admin/settings")
      return response.data
    } catch (error: any) {
      console.error("Error fetching settings:", error)
      throw error.response?.data || { message: "Failed to fetch settings" }
    }
  },

  getSettingByKey: async (key: string) => {
    try {
      const response = await api.get(`/api/admin/settings/${key}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching setting with key ${key}:`, error)
      throw error.response?.data || { message: "Failed to fetch setting" }
    }
  },

  updateSetting: async (key: string, value: string) => {
    try {
      const response = await api.put(`/api/admin/settings/${key}`, { value })
      return response.data
    } catch (error: any) {
      console.error(`Error updating setting with key ${key}:`, error)
      throw error.response?.data || { message: "Failed to update setting" }
    }
  },

  // Modifié pour accepter un tableau de paramètres au lieu d'un objet
  updateMultipleSettings: async (settings: Setting[]) => {
    try {
      const response = await api.put("/api/admin/settings", settings)
      return response.data
    } catch (error: any) {
      console.error("Error updating multiple settings:", error)
      throw error.response?.data || { message: "Failed to update settings" }
    }
  },
}

