import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupervisionLog, DashboardStats } from '../models/supervision.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SupervisionService {
  private api = inject(ApiService);

  // Logs de supervision
  getAllLogs(): Observable<SupervisionLog[]> {
    return this.api.get<SupervisionLog[]>('/supervision/logs');
  }

  getLogsByExploitation(exploitationId: number): Observable<SupervisionLog[]> {
    return this.api.get<SupervisionLog[]>(`/supervision/logs/exploitation/${exploitationId}`);
  }

  getCriticalLogs(): Observable<SupervisionLog[]> {
    return this.api.get<SupervisionLog[]>('/supervision/logs/critical');
  }

  getUnprocessedLogs(): Observable<SupervisionLog[]> {
    return this.api.get<SupervisionLog[]>('/supervision/logs/unprocessed');
  }

  markAsProcessed(logId: number): Observable<SupervisionLog> {
    return this.api.put<SupervisionLog>(`/supervision/logs/${logId}/mark-processed`, {});
  }

  // Statistiques
  getStatistics(eventType: string, hours: number = 24): Observable<number> {
    return this.api.get<number>(`/supervision/statistics/${eventType}`, { hours });
  }

  // Dashboard
  getDashboard(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/supervision/dashboard');
  }

  // Health check
  getHealth(): Observable<any> {
    return this.api.get<any>('/supervision/health');
  }
}