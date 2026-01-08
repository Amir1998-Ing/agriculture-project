export interface SupervisionLog {
  id: number;
  equipementId: number;
  typeEquipement: string;
  typeEvent: string;
  ancienEtat?: string;
  nouvelEtat?: string;
  batterieNiveau?: number;
  exploitationId: number;
  severite: string;
  message: string;
  timestamp: string;
  traite: boolean;
  dateTraitement?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLogs: number;
  criticalLogs: number;
  unprocessedLogs: number;
  recentActivities: SupervisionLog[];
}