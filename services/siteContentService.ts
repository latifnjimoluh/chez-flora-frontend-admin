import api from "./apis"

export const siteContentService = {
  getAllContent: async () => {
    try {
      const response = await api.get("/api/admin/site-content");
      return response.data;
    } catch (error) {
      console.error("Error fetching site content:", error);
      return {
        success: false,
        message: "Erreur lors de la récupération du contenu du site",
      };
    }
  },

  getContentByKey: async (key: string) => {
    try {
      const response = await api.get(`/api/admin/site-content/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching content for key ${key}:`, error);
      return {
        success: false,
        message: "Erreur lors de la récupération du contenu",
      };
    }
  },

  updateContent: async (key: string, contentData: any) => {
    try {
      if (
        (key.includes("_url") || key.includes("_image")) &&
        contentData.file instanceof File
      ) {
        const formData = new FormData();
        formData.append("image", contentData.file);

        const response = await api.put(`/api/admin/site-content/${key}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data;
      } else {
        const response = await api.put(`/api/admin/site-content/${key}`, {
          content_value: contentData.content_value,
        });

        return response.data;
      }
    } catch (error) {
      console.error(`Error updating content for key ${key}:`, error);
      return {
        success: false,
        message: "Erreur lors de la mise à jour du contenu",
      };
    }
  },

  updateMultipleContent: async (contents: { content_key: string; content_value: string }[]) => {
    try {
      const response = await api.put("/api/admin/site-content", { contents });
      return response.data;
    } catch (error) {
      console.error("Error updating multiple content items:", error);
      return {
        success: false,
        message: "Erreur lors de la mise à jour des contenus",
      };
    }
  },
};
