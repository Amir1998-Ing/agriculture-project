// equipements/pages/pompe-detail/pompe-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { EquipementService } from '../../../core/services/equipement.service';
import { PompeConnectee } from '../../../core/models/equipement.model'; 
@Component({
  selector: 'app-pompe-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button 
          mat-button 
          color="primary"
          [routerLink]="['/equipements/pompes']"
          class="mb-4"
        >
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
        
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Pompe #{{ pompe?.id }}</h1>
            <p class="text-gray-600">Détails de la pompe d'irrigation</p>
          </div>
          <div>
            <span 
              [class]="getEtatClass(pompe?.etat || '')"
              class="px-4 py-2 rounded-full text-sm font-medium"
            >
              {{ pompe?.etat }}
            </span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="text-center py-12">
        <mat-icon class="text-red-500" style="font-size: 48px;">error</mat-icon>
        <p class="text-gray-700 mt-2">{{ error }}</p>
        <button 
          mat-raised-button 
          color="primary"
          [routerLink]="['/equipements/pompes']"
          class="mt-4"
        >
          Retour à la liste
        </button>
      </div>

      <!-- Pompe Details -->
      <div *ngIf="pompe && !loading">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Informations -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-blue-500">info</mat-icon>
                Informations de la pompe
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <mat-list>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">ID:</span>
                    <span class="font-medium">{{ pompe.id }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Exploitation ID:</span>
                    <span class="font-medium">{{ pompe.exploitationId }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Modèle:</span>
                    <span class="font-medium">{{ pompe.modele }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Débit maximum:</span>
                    <span class="font-medium">{{ pompe.debitMax }} L/min</span>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Historique -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-green-500">history</mat-icon>
                Historique
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <mat-list>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Dernière mise à jour:</span>
                    <span class="font-medium">{{ formatDate(pompe.derniereMiseAJour) }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full">
                    <span class="text-gray-600">État actuel:</span>
                    <div class="mt-2">
                      <span [class]="getEtatClass(pompe.etat)" class="px-3 py-1 rounded-full text-sm">
                        {{ pompe.etat }}
                      </span>
                    </div>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            mat-raised-button 
            color="primary"
            class="flex items-center justify-center gap-2 p-4"
            (click)="toggleEtat()"
          >
            <mat-icon>{{ pompe.etat === 'ACTIF' ? 'pause' : 'play_arrow' }}</mat-icon>
            {{ pompe.etat === 'ACTIF' ? 'Désactiver' : 'Activer' }}
          </button>

          <button 
            mat-raised-button 
            color="accent"
            class="flex items-center justify-center gap-2 p-4"
            (click)="verifyAccess()"
          >
            <mat-icon>verified_user</mat-icon>
            Vérifier l'accès
          </button>

          <button 
            mat-stroked-button 
            color="warn"
            class="flex items-center justify-center gap-2 p-4"
            (click)="markAsBroken()"
          >
            <mat-icon>report_problem</mat-icon>
            Signaler une panne
          </button>
        </div>
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
export class PompeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private equipementService = inject(EquipementService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  error = '';
  pompe: PompeConnectee | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPompe(+id);
    } else {
      this.error = 'ID de pompe non spécifié';
      this.loading = false;
    }
  }

  loadPompe(id: number) {
    this.equipementService.getPompeById(id).subscribe({
      next: (pompe) => {
        this.pompe = pompe;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la pompe:', error);
        this.error = 'Impossible de charger les détails de la pompe';
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  toggleEtat() {
    if (!this.pompe) return;
    
    const nouvelEtat = this.pompe.etat === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    
    this.equipementService.updatePompeEtat(this.pompe.id, nouvelEtat).subscribe({
      next: () => {
        this.pompe!.etat = nouvelEtat;
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

  verifyAccess() {
    if (!this.pompe) return;
    
    // Vérifier l'accès pour l'agriculteur ID 1 (exemple)
    this.equipementService.verifyAccess(this.pompe.id, 1).subscribe({
      next: (hasAccess) => {
        const message = hasAccess 
          ? '✅ L\'agriculteur a accès à cette pompe'
          : '❌ L\'agriculteur n\'a pas accès à cette pompe';
        
        this.snackBar.open(message, 'Fermer', {
          duration: 5000
        });
      },
      error: (error) => {
        console.error('Erreur lors de la vérification d\'accès:', error);
        this.snackBar.open('Erreur lors de la vérification d\'accès', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  markAsBroken() {
    if (!this.pompe) return;
    
    this.equipementService.updatePompeEtat(this.pompe.id, 'EN_PANNE').subscribe({
      next: () => {
        this.pompe!.etat = 'EN_PANNE';
        this.snackBar.open('Panne signalée pour cette pompe', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors de la signalisation de panne:', error);
        this.snackBar.open('Erreur lors de la signalisation de panne', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}