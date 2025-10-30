export interface ServiceGroup {
  id: string;
  name: string;
  color: string;
  contractId?: string;
}

export interface ActivityType {
  id: string;
  name: string;
  description?: string;
  color: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  maxScore: number;
  required: boolean;
  contractId: string;
}

export interface ServiceLine {
  id: string;
  name: string;
  description: string;
  code: string;
  value: number; // Valor monetário da linha de serviço
  groupId: string; // ID do grupo de trabalho ao qual pertence
}

export interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "currency" | "date" | "dropdown" | "multidropdown" | "boolean" | "rating";
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { id: string; label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
  order: number;
  isActive: boolean;
  contractId?: string;
}

export interface ContractConfig {
  evidenceRequired: boolean;
  documentsRequired: boolean;
  resourcesRequired: boolean;
  unitRequired: boolean;
  demandRequesterRequired: boolean;
  controlPlannedDates: boolean;
  evaluationType: "numeric" | "stars";
  evaluationResult: "average" | "sum";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "collaborator" | "leader" | "fiscal" | "admin";
  avatar?: string;
  isActive: boolean;
  contractId?: string;
}

export interface ContractUser {
  id: string;
  userId: string;
  contractId: string;
  role: "colaborador" | "lider" | "fiscal" | "admin";
  serviceGroups: string[]; // IDs dos grupos de trabalho
  serviceLines: string[]; // IDs das linhas de serviço
  isActive: boolean;
  assignedAt: string;
  assignedBy: string;
}

export interface ActivityType {
  id: string;
  name: string;
  description?: string;
  color: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Scope {
  id: string;
  name: string;
  description?: string;
  color: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  id: string;
  name: string;
  description?: string;
  color: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  description?: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkShift {
  id: string;
  name: string;
  description?: string;
  color: string;
  contractId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserServiceAssignment {
  userId: string;
  serviceGroupId: string;
  serviceLineIds: string[];
}

export interface Contract {
  id: string;
  name: string;
  billingType: "HH" | "BPO" | "ENTREGAVEL";
  serviceGroups: ServiceGroup[];
  serviceLines: ServiceLine[];
  config: ContractConfig;
  dynamicFields: DynamicField[];
  evaluationCriteria: EvaluationCriteria[];
  contractUsers: ContractUser[];
  activityTypes: ActivityType[];
  scopes: Scope[];
  statuses: Status[];
  units: Unit[];
  workShifts: WorkShift[];
  createdAt: string;
  status: "active" | "inactive";
}

export interface EditLog {
  id: string;
  userId: string;
  userName: string;
  editDate: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface Activity {
  id: string;
  title: string;
  collaboratorId: string;
  collaboratorName: string;
  groupId: string;
  typeId: string;
  contractId?: string;
  serviceLineId?: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  observations: string;
  photos: string[];
  documents: { name: string; url: string }[];
  approval?: {
    approverId: string;
    approverName: string;
    approvalDate: string;
    criteriaScores: { criteriaId: string; score: number; comment: string }[];
    rejectionReason?: string;
  };
  editHistory?: EditLog[];
}

export const serviceGroups: ServiceGroup[] = [
  { id: "1", name: "Manutenção de Equipamentos", color: "#3B82F6" },
  { id: "2", name: "Segurança Operacional", color: "#DC2626" },
  { id: "3", name: "Produção de Petróleo", color: "#059669" },
  { id: "4", name: "Perfuração", color: "#7C2D12" },
  { id: "5", name: "Logística e Suprimentos", color: "#7C3AED" },
  { id: "6", name: "Inspeção e Qualidade", color: "#EA580C" },
];

export const activityTypes: ActivityType[] = [
  { 
    id: "1", 
    name: "Manutenção de BOP",
    description: "Manutenção preventiva e corretiva do Blowout Preventer",
    color: "#3B82F6",
    contractId: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "2", 
    name: "Inspeção de Risers",
    description: "Inspeção visual e por ultrassom dos risers",
    color: "#10B981",
    contractId: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "3", 
    name: "Limpeza de Tanques",
    description: "Limpeza e descontaminação de tanques de armazenamento",
    color: "#F59E0B",
    contractId: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "4", 
    name: "Calibração de Instrumentos",
    description: "Calibração de instrumentos de medição e controle",
    color: "#EF4444",
    contractId: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "5", 
    name: "Ronda de Segurança",
    description: "Ronda de inspeção de segurança e verificação de equipamentos",
    color: "#8B5CF6",
    contractId: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const evaluationCriteria: EvaluationCriteria[] = [
  { id: "1", name: "Conformidade com Normas", maxScore: 5, required: true, contractId: "" },
  { id: "2", name: "Uso de EPIs", maxScore: 5, required: true, contractId: "" },
  { id: "3", name: "Procedimentos de Segurança", maxScore: 5, required: true, contractId: "" },
  { id: "4", name: "Qualidade Técnica", maxScore: 5, required: true, contractId: "" },
  { id: "5", name: "Documentação SMS", maxScore: 5, required: false, contractId: "" },
  { id: "6", name: "Limpeza da Área", maxScore: 5, required: false, contractId: "" },
];

// Comments
export interface Comment {
  id: string;
  thread_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface CommentThread {
  id: string;
  x: number;
  y: number;
  comments: Comment[];
}

export const activities: Activity[] = [
  {
    id: "activity_1",
    title: "Desenvolvimento de API REST",
    collaboratorId: "1",
    collaboratorName: "Swellen",
    contractId: "1",
    groupId: "group_1",
    serviceLineId: "line_1",
    typeId: "type_1",
    status: "pending",
    startDate: "2025-01-15T09:00:00Z",
    endDate: "2025-01-15T17:00:00Z",
    photos: [],
    documents: [],
    observations: "Implementação da API REST para o módulo de usuários",
    editHistory: [],
  },
  {
    id: "activity_2",
    title: "Configuração de servidor",
    collaboratorId: "2",
    collaboratorName: "João",
    contractId: "1",
    groupId: "group_2",
    serviceLineId: "line_2",
    typeId: "type_2",
    status: "approved",
    startDate: "2025-01-16T08:00:00Z",
    endDate: "2025-01-16T16:00:00Z",
    photos: [],
    documents: [],
    observations: "Servidor configurado com sucesso",
    editHistory: [],
    approval: {
      approverId: "3",
      approverName: "Leo",
      approvalDate: "2025-01-16T18:00:00Z",
      criteriaScores: [
        { criteriaId: "crit_1", score: 5, comment: "" },
        { criteriaId: "crit_2", score: 4, comment: "" }
      ],
      rejectionReason: "",
    },
  },
];

export const contracts: Contract[] = [
  {
    id: "1",
    name: "Projeto Modernização IT",
    billingType: "HH",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    serviceGroups: [
      {
        id: "group_1",
        name: "Desenvolvimento",
        color: "#3B82F6",
        contractId: "1"
      },
      {
        id: "group_2", 
        name: "Infraestrutura",
        color: "#10B981",
        contractId: "1"
      },
      {
        id: "group_3",
        name: "Testes",
        color: "#F59E0B",
        contractId: "1"
      }
    ],
    serviceLines: [
      {
        id: "line_1",
        name: "Desenvolvimento Backend",
        description: "API REST e serviços backend",
        code: "DEV-BE",
        value: 150.00,
        groupId: "group_1"
      },
      {
        id: "line_2",
        name: "Desenvolvimento Frontend", 
        description: "Interface de usuário React",
        code: "DEV-FE",
        value: 120.00,
        groupId: "group_1"
      },
      {
        id: "line_3",
        name: "Configuração de Servidores",
        description: "Deploy e configuração de infraestrutura",
        code: "INFRA-SRV",
        value: 200.00,
        groupId: "group_2"
      }
    ],
    contractUsers: [
      {
        id: "cu_1",
        userId: "1",
        contractId: "1",
        role: "colaborador",
        serviceGroups: ["group_1"],
        serviceLines: ["line_1", "line_2"],
        isActive: true,
        assignedAt: "2025-01-01T00:00:00Z",
        assignedBy: "admin"
      },
      {
        id: "cu_2",
        userId: "2", 
        contractId: "1",
        role: "lider",
        serviceGroups: ["group_1", "group_2"],
        serviceLines: ["line_1", "line_2", "line_3"],
        isActive: true,
        assignedAt: "2025-01-01T00:00:00Z",
        assignedBy: "admin"
      },
      {
        id: "cu_3",
        userId: "4",
        contractId: "1",
        role: "admin",
        serviceGroups: ["group_1", "group_2", "group_3"],
        serviceLines: ["line_1", "line_2", "line_3"],
        isActive: true,
        assignedAt: "2025-01-01T00:00:00Z",
        assignedBy: "admin"
      }
    ],
    config: {
      evidenceRequired: true,
      documentsRequired: false,
      resourcesRequired: false,
      unitRequired: true,
      demandRequesterRequired: false,
      controlPlannedDates: true,
      evaluationType: "numeric",
      evaluationResult: "average"
    },
    dynamicFields: [
      {
        id: "field_1",
        name: "prioridade",
        label: "Prioridade da Atividade",
        type: "dropdown",
        required: true,
        placeholder: "Selecione a prioridade",
        description: "Nível de prioridade da atividade",
        options: [
          { id: "baixa", label: "Baixa", value: "baixa" },
          { id: "media", label: "Média", value: "media" },
          { id: "alta", label: "Alta", value: "alta" },
          { id: "critica", label: "Crítica", value: "critica" }
        ],
        order: 1,
        isActive: true,
        contractId: "1"
      },
      {
        id: "field_2",
        name: "complexidade",
        label: "Complexidade",
        type: "rating",
        required: false,
        description: "Nível de complexidade da atividade (1-5)",
        min: 1,
        max: 5,
        order: 2,
        isActive: true,
        contractId: "1"
      },
      {
        id: "field_3",
        name: "observacoes_tecnicas",
        label: "Observações Técnicas",
        type: "text",
        required: false,
        placeholder: "Descreva observações técnicas relevantes...",
        description: "Observações técnicas adicionais sobre a atividade",
        validation: {
          maxLength: 500
        },
        order: 3,
        isActive: true,
        contractId: "1"
      }
    ],
    evaluationCriteria: [],
    activityTypes: [
      {
        id: "type_1",
        name: "Desenvolvimento",
        description: "Atividades de desenvolvimento de software",
        color: "#3B82F6",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "type_2",
        name: "Manutenção",
        description: "Atividades de manutenção e suporte",
        color: "#10B981",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }
    ],
    scopes: [
      {
        id: "scope_1",
        name: "Frontend",
        description: "Desenvolvimento de interface de usuário",
        color: "#3B82F6",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "scope_2",
        name: "Backend",
        description: "Desenvolvimento de APIs e serviços",
        color: "#10B981",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }
    ],
    statuses: [
      {
        id: "status_1",
        name: "Pendente",
        description: "Atividade aguardando início",
        color: "#6B7280",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "status_2",
        name: "Em Andamento",
        description: "Atividade em execução",
        color: "#F59E0B",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "status_3",
        name: "Concluída",
        description: "Atividade finalizada",
        color: "#10B981",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }
    ],
    units: [
      {
        id: "unit_1",
        name: "Escritório Central",
        code: "EC001",
        description: "Unidade principal de desenvolvimento",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "unit_2",
        name: "Filial São Paulo",
        code: "SP001",
        description: "Unidade regional de São Paulo",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }
    ],
    workShifts: [
      {
        id: "shift_1",
        name: "Diurno",
        description: "Jornada de trabalho diurna (8h às 17h)",
        color: "#3B82F6",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "shift_2",
        name: "Noturno",
        description: "Jornada de trabalho noturna (22h às 6h)",
        color: "#1F2937",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      },
      {
        id: "shift_3",
        name: "Madrugada",
        description: "Jornada de trabalho na madrugada (0h às 8h)",
        color: "#7C3AED",
        contractId: "1",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z"
      }
    ]
  }
];

