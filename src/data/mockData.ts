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

export interface Activity {
  id: string;
  title: string;
  collaboratorId: string;
  collaboratorName: string;
  groupId: string;
  typeId: string;
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
}

export const serviceGroups: ServiceGroup[] = [
  { id: "1", name: "Manutenção Predial", color: "#3B82F6" },
  { id: "2", name: "Limpeza", color: "#10B981" },
  { id: "3", name: "Segurança", color: "#F59E0B" },
  { id: "4", name: "Jardinagem", color: "#8B5CF6" },
];

export const activityTypes: ActivityType[] = [
  { id: "1", name: "Reparo Elétrico" },
  { id: "2", name: "Reparo Hidráulico" },
  { id: "3", name: "Pintura" },
  { id: "4", name: "Limpeza Geral" },
  { id: "5", name: "Ronda" },
  { id: "6", name: "Poda de Árvores" },
];

export const evaluationCriteria: EvaluationCriteria[] = [
  { id: "1", name: "Qualidade do Trabalho", maxScore: 5, required: true },
  { id: "2", name: "Pontualidade", maxScore: 5, required: true },
  { id: "3", name: "Uso de EPIs", maxScore: 5, required: true },
  { id: "4", name: "Organização", maxScore: 5, required: false },
  { id: "5", name: "Documentação", maxScore: 5, required: false },
];

export const activities: Activity[] = [
  {
    id: "1",
    title: "Troca de lâmpadas no corredor principal",
    collaboratorId: "1",
    collaboratorName: "João Silva",
    groupId: "1",
    typeId: "1",
    startDate: "2025-10-20T08:00",
    endDate: "2025-10-20T10:30",
    status: "approved",
    observations: "Trocadas 15 lâmpadas queimadas",
    photos: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837", "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc"],
    documents: [{ name: "relatorio.pdf", url: "#" }],
    approval: {
      approverId: "3",
      approverName: "Carlos Oliveira",
      approvalDate: "2025-10-20T15:00",
      criteriaScores: [
        { criteriaId: "1", score: 5, comment: "Excelente execução" },
        { criteriaId: "2", score: 5, comment: "Pontual" },
        { criteriaId: "3", score: 5, comment: "Todos os EPIs utilizados" },
        { criteriaId: "4", score: 4, comment: "Boa organização" },
        { criteriaId: "5", score: 5, comment: "Documentação completa" },
      ],
    },
  },
  {
    id: "2",
    title: "Reparo de vazamento no banheiro",
    collaboratorId: "1",
    collaboratorName: "João Silva",
    groupId: "1",
    typeId: "2",
    startDate: "2025-10-21T09:00",
    endDate: "2025-10-21T11:00",
    status: "pending",
    observations: "Substituição de válvula",
    photos: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7"],
    documents: [],
  },
  {
    id: "3",
    title: "Limpeza do estacionamento",
    collaboratorId: "2",
    collaboratorName: "Maria Santos",
    groupId: "2",
    typeId: "4",
    startDate: "2025-10-22T07:00",
    endDate: "2025-10-22T12:00",
    status: "pending",
    observations: "Limpeza completa",
    photos: [],
    documents: [],
  },
];
