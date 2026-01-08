// supervision/pages/supervision-dashboard/supervision-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { SupervisionService } from '../../../core/services/supervision.service'; 
import { DashboardStats,SupervisionLog } from '../../../core/models/supervision.model'; 

@Component({
  selector: 'app-supervision-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Supervision</h1>
            <p class="text-gray-600">Surveillance en temps réel des équipements</p>
          </div>
          <button 
            mat-raised-button 
            color="primary"
            (click)="refreshData()"
          >
            <mat-icon>refresh</mat-icon>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Statistiques -->
      <div *ngIf="!loading" class="mb-8">
        <mat-grid-list cols="4" rowHeight="120px" gutterSize="16px">
          <!-- Total Logs -->
          <mat-grid-tile>
            <mat-card class="w-full h-full">
              <mat-card-content class="p-4 flex items-center">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-blue-100 rounded-full">
                    <mat-icon class="text-blue-600" fontIcon="list_alt"></mat-icon>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Total des logs</p>
                    <p class="text-2xl font-bold text-gray-800">{{ dashboardStats?.totalLogs || 0 }}</p>
                    <p class="text-xs text-gray-500">Historique complet</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <!-- Logs Critiques -->
          <mat-grid-tile>
            <mat-card class="w-full h-full">
              <mat-card-content class="p-4 flex items-center">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-red-100 rounded-full">
                    <mat-icon class="text-red-600" fontIcon="warning"></mat-icon>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Logs critiques</p>
                    <p class="text-2xl font-bold text-gray-800">{{ dashboardStats?.criticalLogs || 0 }}</p>
                    <p class="text-xs text-red-500">Nécessitent attention</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <!-- Logs Non Traités -->
          <mat-grid-tile>
            <mat-card class="w-full h-full">
              <mat-card-content class="p-4 flex items-center">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-yellow-100 rounded-full">
                    <mat-icon class="text-yellow-600" fontIcon="error_outline"></mat-icon>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Non traités</p>
                    <p class="text-2xl font-bold text-gray-800">{{ dashboardStats?.unprocessedLogs || 0 }}</p>
                    <p class="text-xs text-yellow-600">En attente</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>

          <!-- Statut Service -->
          <mat-grid-tile>
            <mat-card class="w-full h-full">
              <mat-card-content class="p-4 flex items-center">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-green-100 rounded-full">
                    <mat-icon class="text-green-600" fontIcon="check_circle"></mat-icon>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Statut service</p>
                    <p class="text-2xl font-bold text-green-600">Actif</p>
                    <p class="text-xs text-green-600">Dernière vérification: {{ lastUpdate }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>
      </div>

      <!-- Dernières Activités -->
      <div *ngIf="!loading" class="mb-8">
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <mat-icon class="text-blue-500">history</mat-icon>
              Dernières activités
            </mat-card-title>
            <mat-card-subtitle>Événements récents de supervision</mat-card-subtitle>
            <button mat-icon-button [routerLink]="['/supervision/logs']" class="ml-auto">
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div *ngIf="recentActivities.length === 0" class="text-center py-8 text-gray-500">
              Aucune activité récente
            </div>
            
            <div *ngFor="let activity of recentActivities" class="border-b py-4 last:border-b-0 hover:bg-gray-50 px-2 rounded">
              <div class="flex items-start gap-4">
                <!-- Icon selon sévérité -->
                <div [class]="getSeverityIconClass(activity.severite)" class="p-2 rounded-full">
                  <mat-icon>{{ getSeverityIcon(activity.severite) }}</mat-icon>
                </div>
                
                <!-- Contenu -->
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium">{{ activity.message }}</p>
                      <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span class="flex items-center gap-1">
                          <mat-icon class="text-sm" fontIcon="device_hub"></mat-icon>
                          {{ activity.typeEquipement }} #{{ activity.equipementId }}
                        </span>
                        <span class="flex items-center gap-1">
                          <mat-icon class="text-sm" fontIcon="business"></mat-icon>
                          Exploitation {{ activity.exploitationId }}
                        </span>
                        <span [class]="getEventTypeClass(activity.typeEvent)" class="px-2 py-1 rounded-full text-xs">
                          {{ activity.typeEvent }}
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-500">{{ formatTimeAgo(activity.timestamp) }}</p>
                      <p class="text-xs text-gray-400">{{ formatDate(activity.timestamp) }}</p>
                    </div>
                  </div>
                  
                  <!-- Détails supplémentaires -->
                  <div *ngIf="activity.ancienEtat || activity.nouvelEtat" class="mt-3 bg-gray-50 p-3 rounded">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div *ngIf="activity.ancienEtat" class="flex items-center gap-2">
                        <span class="text-gray-600">Ancien état:</span>
                        <span class="font-medium">{{ activity.ancienEtat }}</span>
                      </div>
                      <div *ngIf="activity.nouvelEtat" class="flex items-center gap-2">
                        <span class="text-gray-600">Nouvel état:</span>
                        <span class="font-medium">{{ activity.nouvelEtat }}</span>
                      </div>
                      <div *ngIf="activity.batterieNiveau" class="flex items-center gap-2">
                        <span class="text-gray-600">Batterie:</span>
                        <span class="font-medium">{{ activity.batterieNiveau }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Action -->
                <div *ngIf="!activity.traite" class="mt-2">
                  <button 
                    mat-button 
                    color="primary" 
                    size="small"
                    (click)="markAsProcessed(activity)"
                  >
                    Marquer comme traité
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Actions Rapides -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          mat-raised-button 
          color="primary"
          class="flex items-center justify-center gap-2 p-4"
          [routerLink]="['/supervision/logs']"
        >
          <mat-icon>list_alt</mat-icon>
          Voir tous les logs
        </button>
        
        <button 
          mat-raised-button 
          color="warn"
          class="flex items-center justify-center gap-2 p-4"
          [routerLink]="['/supervision/logs/critical']"
        >
          <mat-icon>warning</mat-icon>
          Logs critiques
        </button>
        
        <button 
          mat-stroked-button 
          color="accent"
          class="flex items-center justify-center gap-2 p-4"
          [routerLink]="['/supervision/statistiques']"
        >
          <mat-icon>analytics</mat-icon>
          Statistiques
        </button>
      </div>
    </div>
  `,
  styles: [`
    .severity-high { background-color: #FEE2E2; color: #991B1B; }
    .severity-medium { background-color: #FEF3C7; color: #92400E; }
    .severity-low { background-color: #D1FAE5; color: #065F46; }
    .severity-info { background-color: #DBEAFE; color: #1E40AF; }
    
    .event-change { background-color: #E0F2FE; color: #0369A1; }
    .event-creation { background-color: #DCFCE7; color: #166534; }
    .event-error { background-color: #FEE2E2; color: #991B1B; }
    .event-warning { background-color: #FEF3C7; color: #92400E; }
  `]
})
export class SupervisionDashboardComponent implements OnInit {
  private supervisionService = inject(SupervisionService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  dashboardStats: DashboardStats | null = null;
  recentActivities: SupervisionLog[] = [];
  lastUpdate = '';

  ngOnInit() {
    this.loadDashboard();
    this.updateLastUpdateTime();
  }

  loadDashboard() {
    this.loading = true;
    this.supervisionService.getDashboard().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.recentActivities = stats.recentActivities || [];
        this.loading = false;
        this.updateLastUpdateTime();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  refreshData() {
    this.loadDashboard();
    this.snackBar.open('Données actualisées', 'Fermer', {
      duration: 2000
    });
  }

  updateLastUpdateTime() {
    const now = new Date();
    this.lastUpdate = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSeverityIconClass(severite: string): string {
    const classes: {[key: string]: string} = {
      'HAUTE': 'severity-high',
      'MOYENNE': 'severity-medium',
      'BASSE': 'severity-low',
      'INFO': 'severity-info'
    };
    return classes[severite] || 'severity-info';
  }

  getSeverityIcon(severite: string): string {
    const icons: {[key: string]: string} = {
      'HAUTE': 'warning',
      'MOYENNE': 'error_outline',
      'BASSE': 'info',
      'INFO': 'notifications'
    };
    return icons[severite] || 'notifications';
  }

  getEventTypeClass(typeEvent: string): string {
    const classes: {[key: string]: string} = {
      'ETAT_CHANGE': 'event-change',
      'CREATION': 'event-creation',
      'BATTERIE_LOW': 'event-warning',
      'ERROR': 'event-error',
      'WARNING': 'event-warning'
    };
    return classes[typeEvent] || 'event-change';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  formatTimeAgo(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes < 1) return 'À l\'instant';
      if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } catch (e) {
      return '';
    }
  }

  markAsProcessed(log: SupervisionLog) {
    this.supervisionService.markAsProcessed(log.id).subscribe({
      next: (updatedLog) => {
        log.traite = true;
        log.dateTraitement = updatedLog.dateTraitement;
        this.snackBar.open('Log marqué comme traité', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors du marquage comme traité:', error);
        this.snackBar.open('Erreur lors du traitement', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}