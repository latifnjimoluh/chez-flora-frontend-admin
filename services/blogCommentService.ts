import api from "./apis"

export interface BlogComment {
  id?: number
  post_id: number
  user_id: number
  content: string
  likes?: number
  created_at?: string
  updated_at?: string
  user?: {
    first_name: string
    last_name: string
    email: string
    image?: string
  }
}

export interface CommentLike {
  id?: number
  user_id: number
  comment_id: number
  created_at?: string
}

export const blogCommentService = {
  // Get all comments
  getAllComments: async (): Promise<BlogComment[]> => {
    try {
      const response = await api.get("/admin/blog-comments")
      return response.data
    } catch (error: any) {
      console.error("Error fetching blog comments:", error)
      throw error.response?.data || { message: "Failed to fetch blog comments" }
    }
  },

  // Get comments by post ID
  getCommentsByPostId: async (postId: number): Promise<BlogComment[]> => {
    try {
      const response = await api.get(`/admin/blog-comments/post/${postId}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching comments for post ID ${postId}:`, error)
      throw error.response?.data || { message: "Failed to fetch comments for this post" }
    }
  },

  // Get comment by ID
  getCommentById: async (id: number): Promise<BlogComment> => {
    try {
      const response = await api.get(`/admin/blog-comments/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching comment with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to fetch comment" }
    }
  },

  // Create comment
  createComment: async (commentData: BlogComment): Promise<BlogComment> => {
    try {
      const response = await api.post("/admin/blog-comments", commentData)
      return response.data
    } catch (error: any) {
      console.error("Error creating comment:", error)
      throw error.response?.data || { message: "Failed to create comment" }
    }
  },

  // Update comment
  updateComment: async (id: number, content: string): Promise<BlogComment> => {
    try {
      const response = await api.put(`/admin/blog-comments/${id}`, { content })
      return response.data
    } catch (error: any) {
      console.error(`Error updating comment with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to update comment" }
    }
  },

  // Delete comment
  deleteComment: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin/blog-comments/${id}`)
    } catch (error: any) {
      console.error(`Error deleting comment with ID ${id}:`, error)
      throw error.response?.data || { message: "Failed to delete comment" }
    }
  },

  // Get comment likes
  getCommentLikes: async (commentId: number): Promise<CommentLike[]> => {
    try {
      const response = await api.get(`/admin/blog-comments/${commentId}/likes`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching likes for comment ID ${commentId}:`, error)
      throw error.response?.data || { message: "Failed to fetch comment likes" }
    }
  },
}



