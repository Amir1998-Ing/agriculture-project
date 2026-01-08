// equipements/pages/capteurs-list/capteurs-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { EquipementService } from '../../../core/services/equipement.service'; 
import { CapteurConnecte } from '../../../core/models/equipement.model';

@Component({
  selector: 'app-capteurs-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Capteurs Connectés</h1>
            <p class="text-gray-600">Gérez tous les capteurs de votre exploitation</p>
          </div>
          <button 
            mat-raised-button 
            color="primary"
            [routerLink]="['/equipements/capteurs/nouveau']"
          >
            <mat-icon>add</mat-icon>
            Nouveau Capteur
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && capteurs.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <table mat-table [dataSource]="capteurs" class="w-full">
          <!-- ID -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let capteur">{{ capteur.id }}</td>
          </ng-container>

          <!-- Type -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let capteur">
              <mat-chip [class]="getTypeClass(capteur.type)">
                {{ capteur.type }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Exploitation -->
          <ng-container matColumnDef="exploitationId">
            <th mat-header-cell *matHeaderCellDef>Exploitation</th>
            <td mat-cell *matCellDef="let capteur">{{ capteur.exploitationId }}</td>
          </ng-container>

          <!-- Batterie -->
          <ng-container matColumnDef="batterie">
            <th mat-header-cell *matHeaderCellDef>Batterie</th>
            <td mat-cell *matCellDef="let capteur">
              <div class="flex items-center gap-2">
                <mat-icon 
                  [class]="getBatterieClass(capteur.batterie)"
                  class="text-lg"
                >
                  {{ getBatterieIcon(capteur.batterie) }}
                </mat-icon>
                <span [class]="getBatterieTextClass(capteur.batterie)">
                  {{ capteur.batterie }}%
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Dernière Communication -->
          <ng-container matColumnDef="derniereCommunication">
            <th mat-header-cell *matHeaderCellDef>Dernière communication</th>
            <td mat-cell *matCellDef="let capteur">
              {{ formatDate(capteur.derniereCommunication) }}
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let capteur" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/equipements/capteurs', capteur.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item (click)="updateCommunication(capteur.id)">
                  <mat-icon>refresh</mat-icon>
                  <span>Mettre à jour communication</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && capteurs.length === 0" class="text-center py-12">
        <mat-icon class="text-gray-400" style="font-size: 48px;">sensors</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 mt-4">Aucun capteur trouvé</h3>
        <p class="text-gray-500 mt-2">Commencez par ajouter votre premier capteur</p>
        <button 
          mat-raised-button 
          color="primary"
          class="mt-4"
          [routerLink]="['/equipements/capteurs/nouveau']"
        >
          <mat-icon>add</mat-icon>
          Ajouter un capteur
        </button>
      </div>

      <!-- Statistiques Batterie -->
      <div *ngIf="!loading && capteurs.length > 0" class="mt-8">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Statut des Batteries</mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ goodBatteryCount }}</div>
                <div class="text-sm text-gray-600">Batterie bonne (> 50%)</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ mediumBatteryCount }}</div>
                <div class="text-sm text-gray-600">Batterie moyenne (20-50%)</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">{{ lowBatteryCount }}</div>
                <div class="text-sm text-gray-600">Batterie faible (< 20%)</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .type-humidite { background-color: #DBEAFE; color: #1E40AF; }
    .type-temperature { background-color: #FEE2E2; color: #991B1B; }
    .type-ph { background-color: #D1FAE5; color: #065F46; }
    .type-luminosite { background-color: #FEF3C7; color: #92400E; }
  `]
})
export class CapteursListComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  capteurs: CapteurConnecte[] = [];
  displayedColumns: string[] = ['id', 'type', 'exploitationId', 'batterie', 'derniereCommunication', 'actions'];
  
  // Statistiques
  goodBatteryCount = 0;
  mediumBatteryCount = 0;
  lowBatteryCount = 0;

  ngOnInit() {
    this.loadCapteurs();
  }

  loadCapteurs() {
    this.loading = true;
    // ID d'exploitation par défaut: 1
    this.equipementService.getCapteursByExploitation(1).subscribe({
      next: (capteurs) => {
        this.capteurs = capteurs;
        this.calculateBatteryStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des capteurs:', error);
        this.snackBar.open('Erreur lors du chargement des capteurs', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  calculateBatteryStats() {
    this.goodBatteryCount = this.capteurs.filter(c => c.batterie > 50).length;
    this.mediumBatteryCount = this.capteurs.filter(c => c.batterie >= 20 && c.batterie <= 50).length;
    this.lowBatteryCount = this.capteurs.filter(c => c.batterie < 20).length;
  }

  getTypeClass(type: string): string {
    const classes: {[key: string]: string} = {
      'HUMIDITE': 'type-humidite',
      'TEMPERATURE': 'type-temperature',
      'PH': 'type-ph',
      'LUMINOSITE': 'type-luminosite'
    };
    return classes[type] || '';
  }

  getBatterieClass(batterie: number): string {
    if (batterie > 50) return 'text-green-500';
    if (batterie >= 20) return 'text-yellow-500';
    return 'text-red-500';
  }

  getBatterieTextClass(batterie: number): string {
    if (batterie > 50) return 'text-green-600 font-medium';
    if (batterie >= 20) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  }

  getBatterieIcon(batterie: number): string {
    if (batterie > 80) return 'battery_full';
    if (batterie > 50) return 'battery_6_bar';
    if (batterie > 20) return 'battery_4_bar';
    if (batterie > 10) return 'battery_2_bar';
    return 'battery_0_bar';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  updateCommunication(id: number) {
    this.equipementService.updateCapteurCommunication(id).subscribe({
      next: () => {
        this.snackBar.open('Communication du capteur mise à jour', 'Fermer', {
          duration: 3000
        });
        // Recharger la liste
        this.loadCapteurs();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la communication:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}