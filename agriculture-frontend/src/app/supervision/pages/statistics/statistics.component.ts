// supervision/pages/statistics/statistics.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { SupervisionService } from '../../../core/services/supervision.service'; 

interface Statistic {
  type: string;
  count: number;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatGridListModule,
    MatListModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Statistiques de Supervision</h1>
            <p class="text-gray-600">Analyse des événements et tendances</p>
          </div>
          <button 
            mat-button 
            color="primary"
            [routerLink]="['/supervision/dashboard']"
          >
            <mat-icon>arrow_back</mat-icon>
            Dashboard
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <mat-card class="mb-6">
        <mat-card-content class="p-4">
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Période -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Période</mat-label>
                <mat-select formControlName="period">
                  <mat-option value="24">24 dernières heures</mat-option>
                  <mat-option value="168">7 derniers jours</mat-option>
                  <mat-option value="720">30 derniers jours</mat-option>
                  <mat-option value="custom">Personnalisée</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Type d'événement -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Type d'événement</mat-label>
                <mat-select formControlName="eventType">
                  <mat-option value="all">Tous les événements</mat-option>
                  <mat-option value="ETAT_CHANGE">Changement d'état</mat-option>
                  <mat-option value="CREATION">Création</mat-option>
                  <mat-option value="BATTERIE_LOW">Batterie faible</mat-option>
                  <mat-option value="ERROR">Erreurs</mat-option>
                  <mat-option value="WARNING">Avertissements</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Exploitation -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Exploitation</mat-label>
                <mat-select formControlName="exploitationId">
                  <mat-option value="all">Toutes les exploitations</mat-option>
                  <mat-option *ngFor="let exp of exploitations" [value]="exp.id">
                    Exploitation {{ exp.id }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Période personnalisée -->
            <div *ngIf="filterForm.get('period')?.value === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Date de début</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Date de fin</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="flex justify-end">
              <button 
                mat-raised-button 
                color="primary"
                type="submit"
                [disabled]="loading"
              >
                <mat-icon>search</mat-icon>
                Appliquer les filtres
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Statistiques -->
      <div *ngIf="!loading" class="space-y-6">
        <!-- Cartes de statistiques -->
        <mat-grid-list cols="4" rowHeight="100px" gutterSize="16px">
          <mat-grid-tile *ngFor="let stat of statistics">
            <mat-card class="w-full h-full">
              <mat-card-content class="p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">{{ stat.label }}</p>
                    <p class="text-2xl font-bold" [style.color]="stat.color">
                      {{ stat.count | number }}
                    </p>
                  </div>
                  <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
                </div>
              </mat-card-content>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>

        <!-- Graphiques et détails -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Répartition par type -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Répartition par type d'événement</mat-card-title>
              <mat-card-subtitle>Distribution des événements</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <div *ngIf="eventTypeStats.length === 0" class="text-center py-8 text-gray-500">
                Aucune donnée disponible
              </div>
              <mat-list *ngIf="eventTypeStats.length > 0">
                <mat-list-item *ngFor="let stat of eventTypeStats" class="h-12">
                  <div class="w-full flex justify-between items-center">
                    <div class="flex items-center gap-3">
                      <div [style.background-color]="getEventTypeColor(stat.type)" 
                           class="w-3 h-3 rounded-full"></div>
                      <span>{{ getEventTypeLabel(stat.type) }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-medium">{{ stat.count }}</span>
                      <span class="text-sm text-gray-500">
                        ({{ calculatePercentage(stat.count) }}%)
                      </span>
                    </div>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Répartition par sévérité -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Répartition par sévérité</mat-card-title>
              <mat-card-subtitle>Niveau d'importance des événements</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <div *ngIf="severityStats.length === 0" class="text-center py-8 text-gray-500">
                Aucune donnée disponible
              </div>
              <mat-list *ngIf="severityStats.length > 0">
                <mat-list-item *ngFor="let stat of severityStats" class="h-12">
                  <div class="w-full flex justify-between items-center">
                    <div class="flex items-center gap-3">
                      <mat-icon [style.color]="getSeverityColor(stat.type)" class="text-lg">
                        {{ getSeverityIcon(stat.type) }}
                      </mat-icon>
                      <span>{{ getSeverityLabel(stat.type) }}</span>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-medium">{{ stat.count }}</span>
                      <span class="text-sm text-gray-500">
                        ({{ calculatePercentage(stat.count) }}%)
                      </span>
                    </div>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tendances temporelles -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Tendances temporelles</mat-card-title>
            <mat-card-subtitle>Évolution des événements dans le temps</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 border rounded-lg">
                <div class="text-3xl font-bold text-blue-600 mb-2">
                  {{ hourlyAverage }}
                </div>
                <div class="text-sm text-gray-600">Moyenne horaire</div>
                <div class="text-xs text-gray-500 mt-1">Événements par heure</div>
              </div>
              
              <div class="text-center p-4 border rounded-lg">
                <div class="text-3xl font-bold text-green-600 mb-2">
                  {{ peakHour }}
                </div>
                <div class="text-sm text-gray-600">Heure de pointe</div>
                <div class="text-xs text-gray-500 mt-1">Plus d'événements</div>
              </div>
              
              <div class="text-center p-4 border rounded-lg">
                <div class="text-3xl font-bold text-purple-600 mb-2">
                  {{ getDayWithMostEvents() }}
                </div>
                <div class="text-sm text-gray-600">Jour le plus actif</div>
                <div class="text-xs text-gray-500 mt-1">Plus d'événements</div>
              </div>
            </div>

            <!-- Tableau détaillé -->
            <div class="mt-6">
              <h3 class="text-lg font-medium text-gray-800 mb-4">Détails par heure</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Événements
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type dominant
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sévérité moyenne
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let hour of hourlyData" class="hover:bg-gray-50">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ hour.hour }}h
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex items-center">
                          <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div [style.width.%]="hour.percentage" 
                                 class="bg-blue-600 h-2 rounded-full"></div>
                          </div>
                          {{ hour.count }}
                        </div>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {{ hour.dominantType }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <span [class]="getSeverityClass(hour.avgSeverity)" 
                              class="px-2 py-1 text-xs rounded-full">
                          {{ hour.avgSeverity }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Export et actions -->
        <div class="flex justify-end gap-2">
          <button mat-stroked-button color="primary" (click)="exportToCSV()">
            <mat-icon>download</mat-icon>
            Exporter en CSV
          </button>
          <button mat-stroked-button color="accent" (click)="generateReport()">
            <mat-icon>description</mat-icon>
            Générer un rapport
          </button>
          <button mat-raised-button color="primary" (click)="refreshData()">
            <mat-icon>refresh</mat-icon>
            Actualiser
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
export class StatisticsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supervisionService = inject(SupervisionService);
  private snackBar = inject(MatSnackBar);

  loading = false;
  statistics: Statistic[] = [];
  eventTypeStats: { type: string, count: number }[] = [];
  severityStats: { type: string, count: number }[] = [];
  hourlyData: any[] = [];
  hourlyAverage = 0;
  peakHour = '00:00';
  
  exploitations = [
    { id: 1, name: 'Ferme principale' },
    { id: 2, name: 'Ferme secondaire' },
    { id: 3, name: 'Serre A' }
  ];

  filterForm = this.fb.group({
    period: ['24'],
    eventType: ['all'],
    exploitationId: ['all'],
    startDate: [null],
    endDate: [null]
  });

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;
    
    // Simuler le chargement des statistiques
    setTimeout(() => {
      this.generateSampleData();
      this.loading = false;
    }, 1000);
  }

  generateSampleData() {
    // Statistiques principales
    this.statistics = [
      { type: 'total', count: 156, label: 'Événements totaux', icon: 'bar_chart', color: '#3B82F6' },
      { type: 'critical', count: 12, label: 'Événements critiques', icon: 'warning', color: '#EF4444' },
      { type: 'processed', count: 142, label: 'Événements traités', icon: 'check_circle', color: '#10B981' },
      { type: 'average', count: 6.5, label: 'Moyenne/heure', icon: 'schedule', color: '#8B5CF6' }
    ];

    // Répartition par type d'événement
    this.eventTypeStats = [
      { type: 'ETAT_CHANGE', count: 67 },
      { type: 'CREATION', count: 34 },
      { type: 'BATTERIE_LOW', count: 28 },
      { type: 'ERROR', count: 15 },
      { type: 'WARNING', count: 12 }
    ];

    // Répartition par sévérité
    this.severityStats = [
      { type: 'HAUTE', count: 12 },
      { type: 'MOYENNE', count: 45 },
      { type: 'BASSE', count: 67 },
      { type: 'INFO', count: 32 }
    ];

    // Données horaires
    this.hourlyData = [
      { hour: '00', count: 3, percentage: 15, dominantType: 'ETAT_CHANGE', avgSeverity: 'BASSE' },
      { hour: '06', count: 8, percentage: 40, dominantType: 'CREATION', avgSeverity: 'INFO' },
      { hour: '12', count: 15, percentage: 75, dominantType: 'ETAT_CHANGE', avgSeverity: 'MOYENNE' },
      { hour: '18', count: 12, percentage: 60, dominantType: 'BATTERIE_LOW', avgSeverity: 'HAUTE' },
      { hour: '21', count: 5, percentage: 25, dominantType: 'ERROR', avgSeverity: 'MOYENNE' }
    ];

    this.hourlyAverage = 6.5;
    this.peakHour = '12:00';
  }

  applyFilters() {
    this.loadStatistics();
    this.snackBar.open('Filtres appliqués', 'Fermer', {
      duration: 2000
    });
  }

  calculatePercentage(count: number): number {
    const total = this.statistics.find(s => s.type === 'total')?.count || 1;
    return Math.round((count / total) * 100);
  }

  getEventTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'ETAT_CHANGE': 'Changement d\'état',
      'CREATION': 'Création',
      'BATTERIE_LOW': 'Batterie faible',
      'ERROR': 'Erreur',
      'WARNING': 'Avertissement'
    };
    return labels[type] || type;
  }

  getEventTypeColor(type: string): string {
    const colors: {[key: string]: string} = {
      'ETAT_CHANGE': '#3B82F6',
      'CREATION': '#10B981',
      'BATTERIE_LOW': '#F59E0B',
      'ERROR': '#EF4444',
      'WARNING': '#F59E0B'
    };
    return colors[type] || '#6B7280';
  }

  getSeverityLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'HAUTE': 'Haute',
      'MOYENNE': 'Moyenne',
      'BASSE': 'Basse',
      'INFO': 'Information'
    };
    return labels[type] || type;
  }

  getSeverityColor(type: string): string {
    const colors: {[key: string]: string} = {
      'HAUTE': '#EF4444',
      'MOYENNE': '#F59E0B',
      'BASSE': '#10B981',
      'INFO': '#3B82F6'
    };
    return colors[type] || '#6B7280';
  }

  getSeverityIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'HAUTE': 'warning',
      'MOYENNE': 'error_outline',
      'BASSE': 'info',
      'INFO': 'notifications'
    };
    return icons[type] || 'circle';
  }

  getSeverityClass(severity: string): string {
    const classes: {[key: string]: string} = {
      'HAUTE': 'severity-high',
      'MOYENNE': 'severity-medium',
      'BASSE': 'severity-low',
      'INFO': 'severity-info'
    };
    return classes[severity] || 'severity-info';
  }

  getDayWithMostEvents(): string {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days[Math.floor(Math.random() * days.length)];
  }

  exportToCSV() {
    this.snackBar.open('Export CSV démarré', 'Fermer', {
      duration: 3000
    });
    // Implémenter l'export CSV
  }

  generateReport() {
    this.snackBar.open('Génération du rapport...', 'Fermer', {
      duration: 3000
    });
    // Implémenter la génération de rapport
  }

  refreshData() {
    this.loadStatistics();
    this.snackBar.open('Données actualisées', 'Fermer', {
      duration: 2000
    });
  }
}