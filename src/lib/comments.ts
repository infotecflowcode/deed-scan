import { supabase } from './supabase'

export interface SupabaseComment {
  id: number
  created_at: string
  comentario: string | null
  responsavel: string | null
  thread: string | null
  position_x?: number | null
  position_y?: number | null
  pagina?: string | null
}

export interface CommentData {
  comentario: string
  responsavel: string
  thread: string
  position_x?: number
  position_y?: number
  pagina?: string
}

export const commentService = {
  async createComment(data: CommentData): Promise<SupabaseComment | null> {
    try {

      // Create a base data object with required fields
      const baseData = {
        comentario: data.comentario,
        responsavel: data.responsavel,
        thread: data.thread
      };

      // Only add optional fields if they exist in the table
      const insertData: any = { ...baseData };

      // Add position and page data (always include these now)
      insertData.position_x = data.position_x || 100;
      insertData.position_y = data.position_y || 100;
      insertData.pagina = data.pagina || '/';

      const { data: comment, error } = await supabase
        .from('comentarios')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Error creating comment:', error)
        // If error is about missing columns, try with just base data
        if (error.message.includes('position_x') || error.message.includes('position_y') || error.message.includes('pagina')) {
          const { data: retryComment, error: retryError } = await supabase
            .from('comentarios')
            .insert([baseData])
            .select()
            .single()

          if (retryError) {
            console.error('Retry error:', retryError)
            return null
          }

          return retryComment
        }
        return null
      }

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

  async getCommentsByPage(pagina: string): Promise<SupabaseComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('pagina', pagina)
        .order('created_at', { ascending: true })

      if (error) {
        // If column doesn't exist, fallback to getting all and filtering locally
        if (error.message.includes('pagina')) {
          const allComments = await this.getAllComments()
          return allComments.filter(comment => {
            const commentPage = comment.pagina || '/';
            return commentPage === pagina;
          })
        }
        return []
      }

      return comments || []
    } catch (error) {
      console.error('Error fetching comments by page:', error)
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
      console.error('Exception in getAllComments:', error)
      return []
    }
  },

  async deleteComment(commentId: number): Promise<boolean> {
    try {

      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception when deleting comment:', error)
      return false
    }
  }
}