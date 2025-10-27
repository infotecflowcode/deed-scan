export interface ServiceGroup {
  id: string;
  name: string;
  color: string;
}

export interface ActivityType {
  id: string;
  name: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  maxScore: number;
  required: boolean;
}

export interface ServiceLine {
  id: string;
  name: string;
  description: string;
}

export interface Contract {
  id: string;
  name: string;
  billingType: "HH" | "BPO" | "ENTREGAVEL";
  serviceLines: ServiceLine[];
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
  { id: "1", name: "Manutenção de BOP" },
  { id: "2", name: "Inspeção de Risers" },
  { id: "3", name: "Limpeza de Tanques" },
  { id: "4", name: "Calibração de Instrumentos" },
  { id: "5", name: "Ronda de Segurança" },
  { id: "6", name: "Teste de Pressão" },
  { id: "7", name: "Manutenção de Compressores" },
  { id: "8", name: "Inspeção de Soldas" },
  { id: "9", name: "Operação de Guindaste" },
  { id: "10", name: "Análise de Fluidos" },
  { id: "11", name: "Troca de Filtros" },
  { id: "12", name: "Soldagem Subaquática" },
];

export const evaluationCriteria: EvaluationCriteria[] = [
  { id: "1", name: "Conformidade com Normas", maxScore: 5, required: true },
  { id: "2", name: "Uso de EPIs", maxScore: 5, required: true },
  { id: "3", name: "Procedimentos de Segurança", maxScore: 5, required: true },
  { id: "4", name: "Qualidade Técnica", maxScore: 5, required: true },
  { id: "5", name: "Documentação SMS", maxScore: 5, required: false },
  { id: "6", name: "Limpeza da Área", maxScore: 5, required: false },
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
    id: "1",
    title: "Manutenção preventiva do BOP Stack Principal",
    collaboratorId: "1",
    collaboratorName: "Carlos Pereira",
    groupId: "1",
    typeId: "1",
    startDate: "2025-10-20T06:00",
    endDate: "2025-10-20T14:00",
    status: "approved",
    observations: "Inspeção completa do sistema BOP, troca de selos hidráulicos e teste de pressão conforme procedimento P-001",
    photos: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96", "https://images.unsplash.com/photo-1581092160562-40aa08e78837"],
    documents: [{ name: "BOP_Inspection_Report.pdf", url: "#" }, { name: "Pressure_Test_Results.pdf", url: "#" }],
    contractId: "4",
    serviceLineId: "10",
    approval: {
      approverId: "3",
      approverName: "Ana Rodrigues",
      approvalDate: "2025-10-20T16:00",
      criteriaScores: [
        { criteriaId: "1", score: 5, comment: "Procedimentos seguidos rigorosamente" },
        { criteriaId: "2", score: 5, comment: "EPIs utilizados corretamente" },
        { criteriaId: "3", score: 5, comment: "Todas as normas de segurança atendidas" },
        { criteriaId: "4", score: 5, comment: "Qualidade técnica excepcional" },
        { criteriaId: "5", score: 4, comment: "Documentação SMS completa" },
      ],
    },
  },
  {
    id: "2",
    title: "Inspeção de integridade dos risers de produção",
    collaboratorId: "2",
    collaboratorName: "Roberto Santos",
    groupId: "6",
    typeId: "2",
    startDate: "2025-10-21T08:00",
    endDate: "2025-10-21T16:00",
    status: "pending",
    observations: "Inspeção visual e ultrassônica dos risers 1, 2 e 3. Identificadas pequenas corrosões no riser 2 que necessitam acompanhamento",
    photos: ["https://images.unsplash.com/photo-1565008447742-97f6f38c985c"],
    documents: [{ name: "Riser_Inspection_Checklist.pdf", url: "#" }],
    contractId: "4",
    serviceLineId: "12",
  },
  {
    id: "3",
    title: "Limpeza dos tanques de armazenamento de óleo",
    collaboratorId: "3",
    collaboratorName: "Paulo Mendes",
    groupId: "3",
    typeId: "3",
    startDate: "2025-10-22T04:00",
    endDate: "2025-10-22T20:00",
    status: "pending",
    observations: "Limpeza interna dos tanques T-101 e T-102. Remoção de sedimentos e borra. Preparação para inspeção interna",
    photos: [],
    documents: [],
    contractId: "4",
    serviceLineId: "11",
  },
  {
    id: "4",
    title: "Calibração de transmissores de pressão",
    collaboratorId: "4",
    collaboratorName: "Maria Oliveira",
    groupId: "1",
    typeId: "4",
    startDate: "2025-10-23T09:00",
    endDate: "2025-10-23T17:00",
    status: "approved",
    observations: "Calibração de 15 transmissores de pressão da área de processo. Todos dentro da tolerância especificada",
    photos: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176"],
    documents: [{ name: "Calibration_Certificates.pdf", url: "#" }],
    contractId: "1",
    serviceLineId: "2",
    approval: {
      approverId: "3",
      approverName: "Ana Rodrigues",
      approvalDate: "2025-10-23T18:00",
      criteriaScores: [
        { criteriaId: "1", score: 5, comment: "Conformidade total com padrões" },
        { criteriaId: "2", score: 5, comment: "EPIs corretos utilizados" },
        { criteriaId: "3", score: 5, comment: "Procedimentos de segurança seguidos" },
        { criteriaId: "4", score: 5, comment: "Calibração precisa e documentada" },
      ],
    },
  },
  {
    id: "5",
    title: "Ronda de segurança - Turno noturno",
    collaboratorId: "5",
    collaboratorName: "José Lima",
    groupId: "2",
    typeId: "5",
    startDate: "2025-10-23T22:00",
    endDate: "2025-10-24T06:00",
    status: "rejected",
    observations: "Ronda completa da plataforma. Identificado vazamento menor na linha de gás do módulo C",
    photos: ["https://images.unsplash.com/photo-1621905252507-b35492cc74b4"],
    documents: [],
    approval: {
      approverId: "3",
      approverName: "Ana Rodrigues",
      approvalDate: "2025-10-24T07:00",
      criteriaScores: [
        { criteriaId: "1", score: 3, comment: "Vazamento não foi reportado imediatamente" },
        { criteriaId: "2", score: 5, comment: "EPIs utilizados" },
        { criteriaId: "3", score: 2, comment: "Falha no procedimento de emergência" },
      ],
      rejectionReason: "Vazamento não foi comunicado imediatamente conforme procedimento de emergência",
    },
    contractId: "2",
    serviceLineId: "5",
  },
  {
    id: "6",
    title: "Teste hidrostático de linhas de alta pressão",
    collaboratorId: "1",
    collaboratorName: "Carlos Pereira",
    groupId: "1",
    typeId: "6",
    startDate: "2025-10-24T10:00",
    endDate: "2025-10-24T15:00",
    status: "pending",
    observations: "Teste de pressão das linhas HP-001 a HP-005. Pressão de teste: 1.5x pressão de trabalho",
    photos: [],
    documents: [],
    contractId: "3",
    serviceLineId: "7",
  },
];

export const contracts: Contract[] = [
  {
    id: "1",
    name: "Projeto Modernização IT",
    billingType: "HH",
    serviceLines: [
      { id: "1", name: "Desenvolvimento de Software", description: "Desenvolvimento e manutenção de sistemas" },
      { id: "2", name: "Infraestrutura de TI", description: "Gestão e manutenção da infraestrutura tecnológica" },
      { id: "3", name: "Consultoria Técnica", description: "Consultoria especializada em tecnologia" },
    ],
    createdAt: "2025-01-15T10:00:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Suporte Operacional",
    billingType: "BPO",
    serviceLines: [
      { id: "4", name: "Help Desk", description: "Suporte técnico aos usuários" },
      { id: "5", name: "Monitoramento", description: "Monitoramento 24/7 dos sistemas" },
      { id: "6", name: "Backup e Recovery", description: "Gestão de backup e recuperação de dados" },
    ],
    createdAt: "2025-02-01T09:00:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Desenvolvimento Web",
    billingType: "ENTREGAVEL",
    serviceLines: [
      { id: "7", name: "Frontend Development", description: "Desenvolvimento de interfaces web" },
      { id: "8", name: "Backend Development", description: "Desenvolvimento de APIs e serviços" },
      { id: "9", name: "DevOps", description: "Automação e deploy de aplicações" },
    ],
    createdAt: "2025-03-10T14:00:00Z",
    status: "active",
  },
  {
    id: "4",
    name: "Manutenção Offshore",
    billingType: "HH",
    serviceLines: [
      { id: "10", name: "Manutenção Preventiva", description: "Manutenção programada de equipamentos" },
      { id: "11", name: "Manutenção Corretiva", description: "Reparos emergenciais" },
      { id: "12", name: "Inspeção de Segurança", description: "Inspeções periódicas de segurança" },
    ],
    createdAt: "2025-01-20T08:00:00Z",
    status: "active",
  },
];
