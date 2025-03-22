import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const productApi = axios.create({
  baseURL: `${apiUrl}/api/admin/products`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
productApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Récupérer tous les produits
export const getAllProducts = async (): Promise<any> => {
  try {
    const response = await productApi.get("/")
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des produits", error)
    throw error.response?.data || { message: "Impossible de récupérer les produits." }
  }
}

// Récupérer un produit par son ID
export const getProductById = async (id: string): Promise<any> => {
  try {
    const response = await productApi.get(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération du produit", error)
    throw error.response?.data || { message: "Impossible de récupérer le produit." }
  }
}

// Créer un nouveau produit
export const createProduct = async (productData: {
  nom: string
  description: string
  categorie: string
  images: string[]
  prix: number
  stock: number
  dimensions?: string | null
  poids?: number | null
  options_personnalisation?: string | null
  etat?: "Disponible" | "Indisponible"
  mis_en_avant?: boolean
  statut?: "Disponible" | "Rupture de stock" | "Deleted"
}): Promise<any> => {
  try {
    const response = await productApi.post("/", productData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la création du produit", error)
    throw error.response?.data || { message: "Impossible de créer le produit." }
  }
}

// Mettre à jour un produit
export const updateProduct = async (
  id: string,
  productData: {
    nom?: string
    description?: string
    categorie?: string
    images?: string[]
    prix?: number
    stock?: number
    dimensions?: string | null
    poids?: number | null
    options_personnalisation?: string | null
    etat?: "Disponible" | "Indisponible"
    mis_en_avant?: boolean
    statut?: "Disponible" | "Rupture de stock" | "Deleted"
  },
): Promise<any> => {
  try {
    const response = await productApi.put(`/${id}`, productData)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du produit", error)
    throw error.response?.data || { message: "Impossible de mettre à jour le produit." }
  }
}

// Supprimer un produit
export const deleteProduct = async (id: string): Promise<any> => {
  try {
    const response = await productApi.delete(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la suppression du produit", error)
    throw error.response?.data || { message: "Impossible de supprimer le produit." }
  }
}

// Mettre à jour le statut d'un produit
export const updateProductStatus = async (
  id: string,
  status: "Disponible" | "Rupture de stock" | "Deleted"
): Promise<any> => {
  try {
    const response = await productApi.patch(`/${id}/status`, { statut: status })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du statut du produit", error)
    throw error.response?.data || { message: "Impossible de mettre à jour le statut du produit." }
  }
}

// Mettre à jour la mise en avant d'un produit
export const updateProductFeatured = async (
  id: string,
  featured: boolean
): Promise<any> => {
  try {
    const response = await productApi.patch(`/${id}/featured`, { mis_en_avant: featured })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la mise en avant du produit", error)
    throw error.response?.data || { message: "Impossible de mettre à jour la mise en avant du produit." }
  }
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductFeatured
}
