# Edge Function: admin-update-user-password

Esta Edge Function permite que administradores atualizem a senha de outros usuários do sistema.

## Funcionalidade

Permite que apenas usuários com perfil de **administrador** alterem a senha de qualquer outro usuário do sistema.

## Deploy

### Usando Supabase CLI

```bash
# No diretório raiz do projeto
supabase functions deploy admin-update-user-password

# Ou especificando o projeto
supabase functions deploy admin-update-user-password --project-ref seu-project-ref
```

### Variáveis de Ambiente Necessárias

A Edge Function usa automaticamente as seguintes variáveis de ambiente do Supabase (configuradas automaticamente):

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (para operações administrativas)
- `SUPABASE_ANON_KEY` - Chave anônima (para validação de usuário)

## Uso

### Chamada da Edge Function

```typescript
const { data, error } = await supabase.functions.invoke('admin-update-user-password', {
  body: {
    target_user_id: 'uuid-do-usuario',
    new_password: 'nova-senha-min-6-caracteres'
  }
});
```

### Parâmetros

- `target_user_id` (string, obrigatório): UUID do usuário que terá a senha alterada
- `new_password` (string, obrigatório): Nova senha (mínimo 6 caracteres)

### Resposta de Sucesso

```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "user_id": "uuid-do-usuario",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### Resposta de Erro

```json
{
  "error": "Mensagem de erro descritiva",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Segurança

1. **Autenticação**: Requer token JWT válido no header `Authorization`
2. **Autorização**: Apenas usuários com `profile_type = 'admin'` podem usar esta função
3. **Validação**: Senha deve ter no mínimo 6 caracteres
4. **Logging**: Todas as operações são registradas com informações do administrador e usuário alvo

## Status Codes

- `200` - Sucesso
- `400` - Erro de validação ou falha na atualização
- `401` - Não autenticado
- `403` - Sem permissão (não é administrador)
- `500` - Erro interno do servidor

