// supervision/pages/critical-logs/critical-logs.component.ts
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
  selector: 'app-critical-logs',
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
            <h1 class="text-3xl font-bold text-gray-800">Logs Critiques</h1>
            <p class="text-gray-600">Événements nécessitant une attention immédiate</p>
          </div>
          <div class="flex gap-2">
            <button 
              mat-button 
              color="primary"
              [routerLink]="['/supervision/logs']"
            >
              <mat-icon>arrow_back</mat-icon>
              Tous les logs
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Logs Critiques -->
      <div *ngIf="!loading">
        <!-- Statistiques -->
        <div class="mb-6">
          <mat-card>
            <mat-card-content class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">{{ criticalLogs.length }}</div>
                  <div class="text-sm text-gray-600">Total logs critiques</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-600">{{ unprocessedCount }}</div>
                  <div class="text-sm text-gray-600">En attente de traitement</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ processedCount }}</div>
                  <div class="text-sm text-gray-600">Déjà traités</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Liste des logs -->
        <div *ngIf="criticalLogs.length > 0" class="space-y-4">
          <div *ngFor="let log of criticalLogs" class="border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
            <div class="p-4">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-red-600">warning</mat-icon>
                  <div>
                    <h3 class="font-bold text-gray-800">{{ log.message }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <mat-chip class="bg-red-100 text-red-800">
                        {{ log.typeEquipement }} #{{ log.equipementId }}
                      </mat-chip>
                      <span class="text-sm text-gray-600">
                        Exploitation #{{ log.exploitationId }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">{{ formatDate(log.timestamp) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(log.timestamp) }}</div>
                </div>
              </div>

              <!-- Détails -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="bg-white p-3 rounded border">
                  <div class="text-sm font-medium text-gray-600 mb-2">Informations</div>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Type d'événement:</span>
                      <span class="font-medium">{{ log.typeEvent }}</span>
                    </div>
                    <div *ngIf="log.ancienEtat" class="flex justify-between">
                      <span class="text-gray-600">Ancien état:</span>
                      <span class="font-medium">{{ log.ancienEtat }}</span>
                    </div>
                    <div *ngIf="log.nouvelEtat" class="flex justify-between">
                      <span class="text-gray-600">Nouvel état:</span>
                      <span class="font-medium">{{ log.nouvelEtat }}</span>
                    </div>
                    <div *ngIf="log.batterieNiveau" class="flex justify-between">
                      <span class="text-gray-600">Niveau batterie:</span>
                      <span class="font-medium">{{ log.batterieNiveau }}%</span>
                    </div>
                  </div>
                </div>

                <div class="bg-white p-3 rounded border">
                  <div class="text-sm font-medium text-gray-600 mb-2">Actions</div>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Statut:</span>
                      <span [class]="log.traite ? 'text-green-600' : 'text-red-600'" class="font-medium">
                        {{ log.traite ? 'Traité' : 'Non traité' }}
                      </span>
                    </div>
                    <div *ngIf="log.traite && log.dateTraitement" class="text-sm text-gray-600">
                      Traité le: {{ formatDate(log.dateTraitement) }}
                    </div>
                    <div class="pt-2">
                      <button 
                        *ngIf="!log.traite"
                        mat-raised-button 
                        color="primary" 
                        size="small"
                        (click)="markAsProcessed(log)"
                      >
                        <mat-icon>check_circle</mat-icon>
                        Marquer comme traité
                      </button>
                      <button 
                        mat-button 
                        color="accent" 
                        size="small"
                        class="ml-2"
                        [routerLink]="['/equipements', getEquipmentRoute(log)]"
                      >
                        <mat-icon>launch</mat-icon>
                        Voir l'équipement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aucun log -->
        <div *ngIf="criticalLogs.length === 0" class="text-center py-12">
          <mat-icon class="text-green-500" style="font-size: 48px;">check_circle</mat-icon>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Aucun log critique</h3>
          <p class="text-gray-500 mt-2">Aucun événement critique à signaler</p>
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
  `
})
export class CriticalLogsComponent implements OnInit {
  private supervisionService = inject(SupervisionService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  criticalLogs: SupervisionLog[] = [];
  unprocessedCount = 0;
  processedCount = 0;

  ngOnInit() {
    this.loadCriticalLogs();
  }

  loadCriticalLogs() {
    this.loading = true;
    this.supervisionService.getCriticalLogs().subscribe({
      next: (logs) => {
        this.criticalLogs = logs;
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des logs critiques:', error);
        this.snackBar.open('Erreur lors du chargement des logs critiques', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.unprocessedCount = this.criticalLogs.filter(log => !log.traite).length;
    this.processedCount = this.criticalLogs.filter(log => log.traite).length;
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

  formatTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  markAsProcessed(log: SupervisionLog) {
    this.supervisionService.markAsProcessed(log.id).subscribe({
      next: (updatedLog) => {
        log.traite = true;
        log.dateTraitement = updatedLog.dateTraitement;
        this.updateStats();
        this.snackBar.open('Log critique marqué comme traité', 'Fermer', {
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

  getEquipmentRoute(log: SupervisionLog): string {
    if (log.typeEquipement === 'POMPE') {
      return `pompes/${log.equipementId}`;
    } else if (log.typeEquipement === 'CAPTEUR') {
      return `capteurs/${log.equipementId}`;
    }
    return '';
  }
}