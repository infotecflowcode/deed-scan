import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  target_user_id: string;
  new_password: string;
}

// Função helper para validação
function validateInput(data: any): { valid: boolean; error?: string } {
  if (!data) {
    return { valid: false, error: 'Missing required data' }
  }
  
  if (!data.target_user_id || typeof data.target_user_id !== 'string') {
    return { valid: false, error: 'target_user_id is required and must be a string' }
  }
  
  if (!data.new_password || typeof data.new_password !== 'string') {
    return { valid: false, error: 'new_password is required and must be a string' }
  }
  
  if (data.new_password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' }
  }
  
  return { valid: true }
}

serve(async (req) => {
  const startTime = Date.now()
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. AUTENTICAÇÃO - Validar token JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Cliente com service role para operações administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Cliente com token do usuário para verificar permissões
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 2. AUTORIZAÇÃO - Verificar se é admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('profile_type')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error(`User profile not found: ${profileError.message}`)
    }

    if (!userProfile) {
      console.error('User profile is null for user_id:', user.id)
      throw new Error('User profile not found')
    }

    console.log('User profile found:', { user_id: user.id, profile_type: userProfile.profile_type })

    // Verificar se é administrador (o banco usa 'administrador', não 'admin')
    if (userProfile.profile_type !== 'administrador') {
      console.error('Access denied:', { user_id: user.id, profile_type: userProfile.profile_type })
      throw new Error('Insufficient permissions. Only administrators can update user passwords.')
    }

    // 3. VALIDAÇÃO - Extrair e validar dados de entrada
    const body: RequestBody = await req.json()
    const validation = validateInput(body)
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. ATUALIZAR SENHA - Usar admin API do Supabase
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      body.target_user_id,
      {
        password: body.new_password
      }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    // 5. LOGGING - Registrar operação
    const duration = Date.now() - startTime
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'admin_update_user_password',
      admin_user_id: user.id,
      target_user_id: body.target_user_id,
      duration,
    }))

    // 6. RESPOSTA - Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password updated successfully',
        data: {
          user_id: body.target_user_id,
          updated_at: new Date().toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Response-Time': `${duration}ms`
        },
        status: 200
      }
    )

  } catch (error) {
    // Tratamento centralizado de erros
    const duration = Date.now() - startTime
    
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      duration,
    })

    // Mapear erros para status codes apropriados
    let statusCode = 500
    let errorMessage = 'Internal server error'

    if (error.message.includes('Unauthorized') || error.message.includes('authorization')) {
      statusCode = 401
      errorMessage = 'Unauthorized'
    } else if (error.message.includes('permissions') || error.message.includes('Insufficient')) {
      statusCode = 403
      errorMessage = error.message
    } else if (error.message.includes('Missing') || error.message.includes('required')) {
      statusCode = 400
      errorMessage = error.message
    } else if (error.message.includes('Failed to update')) {
      statusCode = 400
      errorMessage = error.message
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

