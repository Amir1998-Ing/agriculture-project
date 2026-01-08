// supervision/pages/unprocessed-logs/unprocessed-logs.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { SupervisionService } from '../../../core/services/supervision.service'; 
import { SupervisionLog } from '../../../core/models/supervision.model'; 

@Component({
  selector: 'app-unprocessed-logs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Logs Non Traités</h1>
            <p class="text-gray-600">Événements en attente de traitement</p>
          </div>
          <button 
            mat-raised-button 
            color="primary"
            (click)="markAllAsProcessed()"
            [disabled]="unprocessedLogs.length === 0"
          >
            <mat-icon>check_circle</mat-icon>
            Tout marquer comme traité
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Logs -->
      <div *ngIf="!loading">
        <div *ngIf="unprocessedLogs.length > 0" class="space-y-4">
          <div *ngFor="let log of unprocessedLogs" class="border border-yellow-200 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors">
            <div class="p-4">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-yellow-600">schedule</mat-icon>
                  <div>
                    <h3 class="font-bold text-gray-800">{{ log.message }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <mat-chip [class]="getSeverityClass(log.severite)" class="text-xs">
                        {{ log.severite }}
                      </mat-chip>
                      <span class="text-sm text-gray-600">
                        {{ log.typeEquipement }} #{{ log.equipementId }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">{{ formatTimeAgo(log.timestamp) }}</div>
                  <div class="text-xs text-gray-400">{{ formatDate(log.timestamp) }}</div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 mt-4">
                <button 
                  mat-button 
                  color="accent"
                  size="small"
                  [routerLink]="['/equipements', getEquipmentRoute(log)]"
                >
                  <mat-icon>launch</mat-icon>
                  Voir l'équipement
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  size="small"
                  (click)="markAsProcessed(log)"
                >
                  <mat-icon>check_circle</mat-icon>
                  Marquer comme traité
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Aucun log -->
        <div *ngIf="unprocessedLogs.length === 0" class="text-center py-12">
          <mat-icon class="text-green-500" style="font-size: 48px;">check_circle</mat-icon>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Aucun log en attente</h3>
          <p class="text-gray-500 mt-2">Tous les événements ont été traités</p>
          <button 
            mat-raised-button 
            color="primary"
            class="mt-4"
            [routerLink]="['/supervision/logs']"
          >
            Voir tous les logs
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .severity-high { background-color: #FEE2E2; color: #991B1B; }
    .severity-medium { background-color: #FEF3C7; color: #92400E; }
    .severity-low { background-color: #D1FAE5; color: #065F46; }
    .severity-info { background-color: #DBEAFE; color: #1E40AF; }
  `]
})
export class UnprocessedLogsComponent implements OnInit {
  private supervisionService = inject(SupervisionService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  unprocessedLogs: SupervisionLog[] = [];

  ngOnInit() {
    this.loadUnprocessedLogs();
  }

  loadUnprocessedLogs() {
    this.loading = true;
    this.supervisionService.getUnprocessedLogs().subscribe({
      next: (logs) => {
        this.unprocessedLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des logs non traités:', error);
        this.snackBar.open('Erreur lors du chargement des logs', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  getSeverityClass(severite: string): string {
    const classes: {[key: string]: string} = {
      'HAUTE': 'severity-high',
      'MOYENNE': 'severity-medium',
      'BASSE': 'severity-low',
      'INFO': 'severity-info'
    };
    return classes[severite] || 'severity-info';
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
        this.unprocessedLogs = this.unprocessedLogs.filter(l => l.id !== log.id);
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

  markAllAsProcessed() {
    if (this.unprocessedLogs.length === 0) return;

    // Marquer tous les logs
    this.unprocessedLogs.forEach(log => {
      this.supervisionService.markAsProcessed(log.id).subscribe();
    });

    this.snackBar.open(`${this.unprocessedLogs.length} logs marqués comme traités`, 'Fermer', {
      duration: 3000
    });
    
    this.unprocessedLogs = [];
  }

  getEquipmentRoute(log: SupervisionLog): string {
    if (log.typeEquipement === 'POMPE') {
      return `pompes/${log.equipementId}`;
    } else if (log.typeEquipement === 'CAPTEUR') {
      return `capteurs/${log.equipementId}`;
    }
    return '';
  }
}