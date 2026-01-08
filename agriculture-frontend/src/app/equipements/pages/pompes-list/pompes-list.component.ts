// equipements/pages/pompes-list/pompes-list.component.ts
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
import { EquipementService } from '../../../core/services/equipement.service'; 
import { PompeConnectee } from '../../../core/models/equipement.model'; 

@Component({
  selector: 'app-pompes-list',
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
    MatMenuModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Pompes d'Irrigation</h1>
            <p class="text-gray-600">Gérez toutes les pompes de votre exploitation</p>
          </div>
          <button 
            mat-raised-button 
            color="primary"
            [routerLink]="['/equipements/pompes/nouveau']"
          >
            <mat-icon>add</mat-icon>
            Nouvelle Pompe
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && pompes.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <table mat-table [dataSource]="pompes" class="w-full">
          <!-- Nom -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let pompe">{{ pompe.id }}</td>
          </ng-container>

          <!-- Exploitation -->
          <ng-container matColumnDef="exploitationId">
            <th mat-header-cell *matHeaderCellDef>Exploitation</th>
            <td mat-cell *matCellDef="let pompe">{{ pompe.exploitationId }}</td>
          </ng-container>

          <!-- Modèle -->
          <ng-container matColumnDef="modele">
            <th mat-header-cell *matHeaderCellDef>Modèle</th>
            <td mat-cell *matCellDef="let pompe">{{ pompe.modele }}</td>
          </ng-container>

          <!-- État -->
          <ng-container matColumnDef="etat">
            <th mat-header-cell *matHeaderCellDef>État</th>
            <td mat-cell *matCellDef="let pompe">
              <span [class]="getEtatClass(pompe.etat)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ pompe.etat }}
              </span>
            </td>
          </ng-container>

          <!-- Débit -->
          <ng-container matColumnDef="debitMax">
            <th mat-header-cell *matHeaderCellDef>Débit max</th>
            <td mat-cell *matCellDef="let pompe">{{ pompe.debitMax }} L/min</td>
          </ng-container>

          <!-- Dernière MAJ -->
          <ng-container matColumnDef="derniereMiseAJour">
            <th mat-header-cell *matHeaderCellDef>Dernière mise à jour</th>
            <td mat-cell *matCellDef="let pompe">{{ formatDate(pompe.derniereMiseAJour) }}</td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let pompe" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/equipements/pompes', pompe.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir détails</span>
                </button>
                <button mat-menu-item (click)="changeEtat(pompe)">
                  <mat-icon>swap_horiz</mat-icon>
                  <span>Changer état</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && pompes.length === 0" class="text-center py-12">
        <mat-icon class="text-gray-400" style="font-size: 48px;">water_damage</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 mt-4">Aucune pompe trouvée</h3>
        <p class="text-gray-500 mt-2">Commencez par ajouter votre première pompe d'irrigation</p>
        <button 
          mat-raised-button 
          color="primary"
          class="mt-4"
          [routerLink]="['/equipements/pompes/nouveau']"
        >
          <mat-icon>add</mat-icon>
          Ajouter une pompe
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          mat-raised-button 
          color="primary" 
          class="flex items-center justify-center gap-2 p-4"
          (click)="activateAll()"
          [disabled]="pompes.length === 0"
        >
          <mat-icon>play_arrow</mat-icon>
          Activer toutes les pompes
        </button>
        <button 
          mat-stroked-button 
          color="warn" 
          class="flex items-center justify-center gap-2 p-4"
          (click)="deactivateAll()"
          [disabled]="pompes.length === 0"
        >
          <mat-icon>pause</mat-icon>
          Désactiver toutes les pompes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .etat-actif {
      background-color: #D1FAE5;
      color: #065F46;
    }
    .etat-inactif {
      background-color: #F3F4F6;
      color: #374151;
    }
  `]
})
export class PompesListComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  pompes: PompeConnectee[] = [];
  displayedColumns: string[] = ['id', 'exploitationId', 'modele', 'etat', 'debitMax', 'derniereMiseAJour', 'actions'];

  ngOnInit() {
    this.loadPompes();
  }

  loadPompes() {
    this.loading = true;
    // ID d'exploitation par défaut: 1
    this.equipementService.getPompesByExploitation(1).subscribe({
      next: (pompes) => {
        this.pompes = pompes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pompes:', error);
        this.snackBar.open('Erreur lors du chargement des pompes', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  getEtatClass(etat: string): string {
    return etat === 'ACTIF' ? 'etat-actif' : 'etat-inactif';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
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

  changeEtat(pompe: PompeConnectee) {
    const nouvelEtat = pompe.etat === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    
    this.equipementService.updatePompeEtat(pompe.id, nouvelEtat).subscribe({
      next: () => {
        pompe.etat = nouvelEtat;
        this.snackBar.open(`État de la pompe modifié: ${nouvelEtat}`, 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors du changement d\'état:', error);
        this.snackBar.open('Erreur lors du changement d\'état', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  activateAll() {
    // Activer toutes les pompes
    this.pompes.forEach(pompe => {
      if (pompe.etat !== 'ACTIF') {
        this.equipementService.updatePompeEtat(pompe.id, 'ACTIF').subscribe({
          next: () => {
            pompe.etat = 'ACTIF';
          }
        });
      }
    });
    
    this.snackBar.open('Toutes les pompes ont été activées', 'Fermer', {
      duration: 3000
    });
  }

  deactivateAll() {
    // Désactiver toutes les pompes
    this.pompes.forEach(pompe => {
      if (pompe.etat === 'ACTIF') {
        this.equipementService.updatePompeEtat(pompe.id, 'INACTIF').subscribe({
          next: () => {
            pompe.etat = 'INACTIF';
          }
        });
      }
    });
    
    this.snackBar.open('Toutes les pompes ont été désactivées', 'Fermer', {
      duration: 3000
    });
  }
}