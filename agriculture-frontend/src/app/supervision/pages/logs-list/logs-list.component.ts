// supervision/pages/logs-list/logs-list.component.ts
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { SupervisionService } from '../../../core/services/supervision.service'; 
import { SupervisionLog } from '../../../core/models/supervision.model';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Logs de Supervision</h1>
            <p class="text-gray-600">Historique complet des événements système</p>
          </div>
          <div class="flex gap-2">
            <button 
              mat-raised-button 
              color="primary"
              [routerLink]="['/supervision/dashboard']"
            >
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button 
              mat-raised-button 
              color="warn"
              [routerLink]="['/supervision/logs/critical']"
            >
              <mat-icon>warning</mat-icon>
              Critiques
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <mat-card class="mb-6">
        <mat-card-content class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Recherche -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Rechercher</mat-label>
              <input 
                matInput 
                (keyup)="applyFilter($event)" 
                placeholder="Message, équipement..."
                #input
              >
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Filtre par sévérité -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Sévérité</mat-label>
              <mat-select (selectionChange)="filterBySeverity($event.value)" [value]="'all'">
                <mat-option value="all">Toutes les sévérités</mat-option>
                <mat-option value="HAUTE">Haute</mat-option>
                <mat-option value="MOYENNE">Moyenne</mat-option>
                <mat-option value="BASSE">Basse</mat-option>
                <mat-option value="INFO">Info</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Filtre par type d'événement -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type d'événement</mat-label>
              <mat-select (selectionChange)="filterByEventType($event.value)" [value]="'all'">
                <mat-option value="all">Tous les types</mat-option>
                <mat-option value="ETAT_CHANGE">Changement d'état</mat-option>
                <mat-option value="CREATION">Création</mat-option>
                <mat-option value="BATTERIE_LOW">Batterie faible</mat-option>
                <mat-option value="ERROR">Erreur</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Filtre par statut -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Statut</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)" [value]="'all'">
                <mat-option value="all">Tous les statuts</mat-option>
                <mat-option value="processed">Traité</mat-option>
                <mat-option value="unprocessed">Non traité</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Tableau -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center">
          <div class="text-sm text-gray-500">
            {{ dataSource.filteredData.length }} log(s) trouvé(s)
          </div>
          <div class="flex items-center gap-2">
            <button mat-button color="primary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Actualiser
            </button>
            <button mat-button color="accent" (click)="markAllAsProcessed()" [disabled]="!hasUnprocessedLogs()">
              <mat-icon>check_circle</mat-icon>
              Tout marquer comme traité
            </button>
          </div>
        </div>

        <table mat-table [dataSource]="dataSource" matSort class="w-full">
          <!-- Timestamp -->
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date/Heure</th>
            <td mat-cell *matCellDef="let log">
              <div class="text-sm">
                <div>{{ formatDate(log.timestamp) }}</div>
                <div class="text-gray-500">{{ formatTime(log.timestamp) }}</div>
              </div>
            </td>
          </ng-container>

          <!-- Type Équipement -->
          <ng-container matColumnDef="typeEquipement">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Équipement</th>
            <td mat-cell *matCellDef="let log">
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-500">{{ getEquipmentIcon(log.typeEquipement) }}</mat-icon>
                <div>
                  <div>{{ log.typeEquipement }}</div>
                  <div class="text-xs text-gray-500">ID: {{ log.equipementId }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Message -->
          <ng-container matColumnDef="message">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Message</th>
            <td mat-cell *matCellDef="let log">
              <div class="max-w-md">
                <p class="font-medium">{{ log.message }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <mat-chip [class]="getEventTypeClass(log.typeEvent)" class="text-xs">
                    {{ log.typeEvent }}
                  </mat-chip>
                  <span *ngIf="log.ancienEtat" class="text-xs text-gray-600">
                    {{ log.ancienEtat }} → {{ log.nouvelEtat }}
                  </span>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Sévérité -->
          <ng-container matColumnDef="severite">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Sévérité</th>
            <td mat-cell *matCellDef="let log">
              <mat-chip [class]="getSeverityClass(log.severite)" class="font-medium">
                {{ log.severite }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Exploitation -->
          <ng-container matColumnDef="exploitationId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Exploitation</th>
            <td mat-cell *matCellDef="let log">
              <div class="flex items-center gap-2">
                <mat-icon class="text-green-500">business</mat-icon>
                <span>#{{ log.exploitationId }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Statut -->
          <ng-container matColumnDef="traite">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
            <td mat-cell *matCellDef="let log">
              <span [class]="log.traite ? 'text-green-600' : 'text-yellow-600'" class="flex items-center gap-1">
                <mat-icon>{{ log.traite ? 'check_circle' : 'schedule' }}</mat-icon>
                {{ log.traite ? 'Traité' : 'En attente' }}
              </span>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let log" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewDetails(log)">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button *ngIf="!log.traite" mat-menu-item (click)="markAsProcessed(log)">
                  <mat-icon>check_circle</mat-icon>
                  <span>Marquer comme traité</span>
                </button>
                <button mat-menu-item [routerLink]="['/equipements', getEquipmentRoute(log)]">
                  <mat-icon>launch</mat-icon>
                  <span>Voir l'équipement</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row when no data -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell py-8 text-center text-gray-500" [attr.colspan]="displayedColumns.length">
              Aucun log trouvé
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
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
export class LogsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private supervisionService = inject(SupervisionService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  logs: SupervisionLog[] = [];
  displayedColumns: string[] = ['timestamp', 'typeEquipement', 'message', 'severite', 'exploitationId', 'traite', 'actions'];
  dataSource = new MatTableDataSource<SupervisionLog>([]);

  ngOnInit() {
    this.loadLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'timestamp': return new Date(item.timestamp).getTime();
        default: return item[property as keyof SupervisionLog] as string;
      }
    };
  }

  loadLogs() {
    this.loading = true;
    this.supervisionService.getAllLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.dataSource.data = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des logs:', error);
        this.snackBar.open('Erreur lors du chargement des logs', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterBySeverity(severity: string) {
    if (severity === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = severity;
      this.dataSource.filterPredicate = (data, filter) => 
        data.severite.toLowerCase() === filter.toLowerCase();
    }
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByEventType(eventType: string) {
    if (eventType === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = eventType;
      this.dataSource.filterPredicate = (data, filter) => 
        data.typeEvent.toLowerCase() === filter.toLowerCase();
    }
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string) {
    if (status === 'all') {
      this.dataSource.filter = '';
    } else if (status === 'processed') {
      this.dataSource.filterPredicate = (data, filter) => data.traite === true;
      this.dataSource.filter = 'true';
    } else if (status === 'unprocessed') {
      this.dataSource.filterPredicate = (data, filter) => data.traite === false;
      this.dataSource.filter = 'false';
    }
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getEquipmentIcon(typeEquipement: string): string {
    const icons: {[key: string]: string} = {
      'POMPE': 'opacity',
      'CAPTEUR': 'sensors',
      'TRACTEUR': 'agriculture',
      'SYSTEME': 'settings'
    };
    return icons[typeEquipement] || 'device_hub';
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

  refreshData() {
    this.loadLogs();
    this.snackBar.open('Logs actualisés', 'Fermer', {
      duration: 2000
    });
  }

  viewDetails(log: SupervisionLog) {
    // Implémenter la vue détaillée
    console.log('Voir détails:', log);
    this.snackBar.open(`Détails du log #${log.id}`, 'Fermer', {
      duration: 3000
    });
  }

  markAsProcessed(log: SupervisionLog) {
    this.supervisionService.markAsProcessed(log.id).subscribe({
      next: (updatedLog) => {
        log.traite = true;
        log.dateTraitement = updatedLog.dateTraitement;
        this.dataSource.data = [...this.dataSource.data];
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
    const unprocessedLogs = this.logs.filter(log => !log.traite);
    if (unprocessedLogs.length === 0) return;

    // Marquer tous les logs non traités
    unprocessedLogs.forEach(log => {
      this.supervisionService.markAsProcessed(log.id).subscribe({
        next: (updatedLog) => {
          log.traite = true;
          log.dateTraitement = updatedLog.dateTraitement;
        }
      });
    });

    this.dataSource.data = [...this.dataSource.data];
    this.snackBar.open(`${unprocessedLogs.length} logs marqués comme traités`, 'Fermer', {
      duration: 3000
    });
  }

  hasUnprocessedLogs(): boolean {
    return this.logs.some(log => !log.traite);
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