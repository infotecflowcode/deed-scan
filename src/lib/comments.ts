import { supabase } from './supabase'

export interface SupabaseComment {
  id: number
  created_at: string
  comentario: string | null
  responsavel: string | null
  thread: string | null
}

export interface CommentData {
  comentario: string
  responsavel: string
  thread: string
}

export const commentService = {
  async createComment(data: CommentData): Promise<SupabaseComment | null> {
    try {
      console.log('Attempting to create comment with data:', data)

      const { data: comment, error } = await supabase
        .from('comentarios')
        .insert([data])
        .select()
        .single()

      console.log('Supabase response:', { comment, error })

      if (error) {
        console.error('Error creating comment:', error)
        return null
      }

      console.log('Comment created successfully:', comment)
      return comment
    } catch (error) {
      console.error('Exception when creating comment:', error)
      return null
    }
  },

  async getCommentsByThread(threadId: string): Promise<SupabaseComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('thread', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return []
      }

      return comments || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  async getAllComments(): Promise<SupabaseComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching all comments:', error)
        return []
      }

      return comments || []
    } catch (error) {
      console.error('Error fetching all comments:', error)
      return []
    }
  },

  async deleteComment(commentId: number): Promise<boolean> {
    try {
      console.log('Attempting to delete comment with id:', commentId)

      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        return false
      }

      console.log('Comment deleted successfully')
      return true
    } catch (error) {
      console.error('Exception when deleting comment:', error)
      return false
    }
  }
}