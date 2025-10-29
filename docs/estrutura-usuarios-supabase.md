# Estrutura de Usuários - Supabase
## Sistema CDA+ - Gestão de Atividades

### Visão Geral
Este documento define a estrutura de tabelas e relacionamentos para implementar o sistema de usuários no Supabase, baseado nas regras de negócio do CDA+.

---

## 1. ESTRATÉGIA DE AUTENTICAÇÃO

### 1.1 Supabase Auth + Tabelas Customizadas
- **Autenticação**: Supabase Auth (tabela `auth.users`)
- **Perfis**: Tabela customizada `user_profiles` vinculada ao `auth.users`
- **Permissões**: Sistema baseado em perfis e contratos
- **Segurança**: Row Level Security (RLS) para controle de acesso

### 1.2 Vantagens da Abordagem
- Segurança robusta do Supabase Auth
- JWT automático com refresh tokens
- Recuperação de senha e 2FA nativos
- Row Level Security para controle granular
- Auditoria automática de acessos

---

## 2. ESTRUTURA DE TABELAS

### 2.1 Tabela: `contracts`
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

### 2.2 Tabela: `service_groups`
```sql
CREATE TABLE service_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(contract_id, name)
);
```

### 2.3 Tabela: `service_lines`
```sql
CREATE TABLE service_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_group_id UUID NOT NULL REFERENCES service_groups(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(service_group_id, code)
);
```

### 2.4 Tabela: `user_profiles`
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('colaborador', 'lider', 'fiscal', 'administrador')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(user_id)
);
```

### 2.5 Tabela: `user_contracts`
```sql
CREATE TABLE user_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('colaborador', 'lider', 'fiscal', 'administrador')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(user_id, contract_id)
);
```

### 2.6 Tabela: `user_service_lines`
```sql
CREATE TABLE user_service_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_line_id UUID NOT NULL REFERENCES service_lines(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(user_id, service_line_id)
);
```

### 2.7 Tabela: `contract_custom_fields`
```sql
CREATE TABLE contract_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'dropdown')),
    is_required BOOLEAN DEFAULT false,
    options JSONB, -- Para campos dropdown
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(contract_id, field_name)
);
```

### 2.8 Tabela: `contract_custom_field_values`
```sql
CREATE TABLE contract_custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    custom_field_id UUID NOT NULL REFERENCES user_custom_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(user_id, contract_id, custom_field_id)
);
```

### 2.9 Tabela: `audit_logs`
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

---

## 3. ÍNDICES E PERFORMANCE

### 3.1 Índices Essenciais
```sql
-- Índices para performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_contracts_user_id ON user_contracts(user_id);
CREATE INDEX idx_user_contracts_contract_id ON user_contracts(contract_id);
CREATE INDEX idx_user_service_lines_user_id ON user_service_lines(user_id);
CREATE INDEX idx_user_service_lines_service_line_id ON user_service_lines(service_line_id);
CREATE INDEX idx_service_lines_service_group_id ON service_lines(service_group_id);
CREATE INDEX idx_service_groups_contract_id ON service_groups(contract_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 4. ROW LEVEL SECURITY (RLS)

### 4.1 Políticas de Segurança
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_service_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para user_profiles (usuário só vê seu próprio perfil)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Política para user_contracts (usuário vê apenas seus contratos)
CREATE POLICY "Users can view own contracts" ON user_contracts
    FOR SELECT USING (auth.uid() = user_id);

-- Política para administradores (acesso total)
CREATE POLICY "Admins have full access" ON contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_contracts uc 
            WHERE uc.user_id = auth.uid() 
            AND uc.profile_type = 'administrador'
            AND uc.is_active = true
        )
    );
```

---

## 5. FUNÇÕES E TRIGGERS

### 5.1 Função de Auditoria
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Triggers de Auditoria
```sql
-- Aplicar triggers em todas as tabelas principais
CREATE TRIGGER contracts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER user_profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER user_contracts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_contracts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ... aplicar em todas as outras tabelas
```

---

## 6. VIEWS ÚTEIS

### 6.1 View: Usuários com Contratos
```sql
CREATE VIEW v_users_with_contracts AS
SELECT 
    up.id as profile_id,
    up.user_id,
    up.name,
    up.email,
    up.profile_type,
    c.id as contract_id,
    c.name as contract_name,
    uc.is_active as contract_active
FROM user_profiles up
JOIN user_contracts uc ON up.user_id = uc.user_id
JOIN contracts c ON uc.contract_id = c.id
WHERE up.is_active = true;
```

### 6.2 View: Usuários com Linhas de Serviço
```sql
CREATE VIEW v_users_with_service_lines AS
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.profile_type,
    sl.id as service_line_id,
    sl.code as service_line_code,
    sl.name as service_line_name,
    sl.value as service_line_value,
    sg.name as service_group_name,
    c.name as contract_name
FROM user_profiles up
JOIN user_service_lines usl ON up.user_id = usl.user_id
JOIN service_lines sl ON usl.service_line_id = sl.id
JOIN service_groups sg ON sl.service_group_id = sg.id
JOIN contracts c ON sg.contract_id = c.id
WHERE up.is_active = true AND usl.is_active = true;
```

---

## 7. MIGRAÇÕES INICIAIS

### 7.1 Dados de Exemplo
```sql
-- Inserir contrato de exemplo
INSERT INTO contracts (name, description, start_date, end_date) 
VALUES ('Contrato InfoTec 2024', 'Contrato principal de desenvolvimento', '2024-01-01', '2024-12-31');

-- Inserir grupos de serviço
INSERT INTO service_groups (contract_id, name, description) 
VALUES 
    ((SELECT id FROM contracts WHERE name = 'Contrato InfoTec 2024'), 'Desenvolvimento', 'Grupo de desenvolvimento de software'),
    ((SELECT id FROM contracts WHERE name = 'Contrato InfoTec 2024'), 'Suporte', 'Grupo de suporte técnico');

-- Inserir linhas de serviço
INSERT INTO service_lines (service_group_id, code, name, description, value)
VALUES 
    ((SELECT id FROM service_groups WHERE name = 'Desenvolvimento'), 'DEV001', 'Desenvolvimento Frontend', 'Desenvolvimento de interfaces', 150.00),
    ((SELECT id FROM service_groups WHERE name = 'Desenvolvimento'), 'DEV002', 'Desenvolvimento Backend', 'Desenvolvimento de APIs', 200.00),
    ((SELECT id FROM service_groups WHERE name = 'Suporte'), 'SUP001', 'Suporte Nível 1', 'Suporte básico', 100.00);
```

---

## 8. CONSIDERAÇÕES DE IMPLEMENTAÇÃO

### 8.1 Ordem de Criação
1. Criar tabelas na ordem de dependências
2. Aplicar índices
3. Configurar RLS
4. Criar funções e triggers
5. Criar views
6. Inserir dados iniciais

### 8.2 Validações
- Implementar validações de perfil por contrato
- Verificar se usuário tem acesso ao contrato antes de operações
- Validar transições de status de usuário
- Implementar checks de integridade referencial

### 8.3 Performance
- Monitorar performance das queries com RLS
- Considerar materialized views para relatórios complexos
- Implementar cache para consultas frequentes
- Otimizar índices baseado no uso real

---

## 9. PRÓXIMOS PASSOS

1. **Revisar estrutura** com a equipe
2. **Criar migrações** no Supabase
3. **Implementar RLS** e testar segurança
4. **Criar funções auxiliares** para operações comuns
5. **Implementar frontend** para gerenciamento de usuários
6. **Testes de integração** e performance
7. **Documentação da API** para frontend

---

*Documento criado em: $(date)*
*Versão: 1.0*
*Autor: Sistema CDA+*
