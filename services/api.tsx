// Fonction utilitaire pour récupérer le token
export const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  }
  
  // Fonction utilitaire pour définir le token
  export const setAuthToken = (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }
  
  // Fonction utilitaire pour supprimer le token
  export const removeAuthToken = (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }
  
  