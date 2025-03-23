/**
 * Service pour gérer les uploads d'images vers Cloudinary
 */

type MediaType = "produit" | "service" | "blog" | "pp" | "autre";

// 📁 Mapping des types vers les dossiers Cloudinary
const folderMap: Record<MediaType, string> = {
  produit: "chezflora/produits",
  service: "chezflora/services",
  blog: "chezflora/blog",
  pp: "chezflora/pp",
  autre: "chezflora/autres",
};

/**
 * Upload une seule image vers Cloudinary
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "chezflora/produits"
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file); // 👈 doit correspondre à multer.single("image")
    formData.append("folder", folder);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload/cloudinary`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de l'upload de l'image");
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error("Erreur lors de l'upload de l'image:", error);
    throw error;
  }
};

/**
 * Upload plusieurs images vers Cloudinary
 */
export const uploadMultipleImagesToCloudinary = async (
  files: File[],
  folder: string = "chezflora/produits"
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Erreur lors de l'upload multiple d'images:", error);
    throw error;
  }
};

/**
 * Upload une image vers un dossier basé sur son type
 */
export const uploadImageByType = async (file: File, type: MediaType): Promise<string> => {
  const folder = folderMap[type] || folderMap.autre;
  return await uploadImageToCloudinary(file, folder);
};

/**
 * Upload plusieurs images vers un dossier basé sur leur type
 */
export const uploadMultipleImagesByType = async (files: File[], type: MediaType): Promise<string[]> => {
  const folder = folderMap[type] || folderMap.autre;
  return await uploadMultipleImagesToCloudinary(files, folder);
};
