import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')

    // Test 1: Basic connection
    const { data, error } = await supabase.from('comentarios').select('count', { count: 'exact' })

    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }

    console.log('Supabase connected successfully! Row count:', data)

    // Test 2: Try to insert
    const { data: insertData, error: insertError } = await supabase
      .from('comentarios')
      .insert([{
        comentario: 'Test comment',
        responsavel: 'Test User',
        thread: 'test-thread'
      }])
      .select()

    if (insertError) {
      console.error('Insert test failed:', insertError)
      return false
    }

    console.log('Insert test successful:', insertData)
    return true

  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}