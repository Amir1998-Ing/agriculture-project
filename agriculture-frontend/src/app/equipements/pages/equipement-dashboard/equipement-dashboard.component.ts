// equipements/pages/equipement-dashboard/equipement-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EquipementService } from '../../../core/services/equipement.service';

@Component({
  selector: 'app-equipement-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Tableau de bord des Équipements</h1>
            <p class="text-gray-600">Gérez vos pompes et capteurs connectés</p>
          </div>
          
        </div>
      </div>

      <!-- Health Status -->
      <div class="mb-8">
        <mat-card>
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-800">Statut du service</h3>
                <p class="text-gray-600" *ngIf="healthMessage">{{ healthMessage }}</p>
              </div>
              <mat-icon 
                [class]="healthStatus === 'UP' ? 'text-green-500' : 'text-red-500'"
                style="font-size: 40px;"
              >
                {{ healthStatus === 'UP' ? 'check_circle' : 'error' }}
              </mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Stats -->
      <mat-grid-list cols="4" rowHeight="100px" gutterSize="16px" class="mb-8">
        <!-- Pompes -->
        <mat-grid-tile>
          <mat-card class="w-full h-full">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Pompes</p>
                  <p class="text-2xl font-bold text-blue-600">{{ pompesCount }}</p>
                </div>
                <mat-icon class="text-blue-500">opacity</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Capteurs -->
        <mat-grid-tile>
          <mat-card class="w-full h-full">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Capteurs</p>
                  <p class="text-2xl font-bold text-green-600">{{ capteursCount }}</p>
                </div>
                <mat-icon class="text-green-500">sensors</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Pompes Actives -->
        <mat-grid-tile>
          <mat-card class="w-full h-full">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Pompes actives</p>
                  <p class="text-2xl font-bold text-green-600">{{ activePompesCount }}</p>
                </div>
                <mat-icon class="text-green-500">play_arrow</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Batterie Faible -->
        <mat-grid-tile>
          <mat-card class="w-full h-full">
            <mat-card-content class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Batterie faible</p>
                  <p class="text-2xl font-bold text-yellow-600">{{ lowBatteryCount }}</p>
                </div>
                <mat-icon class="text-yellow-500">battery_alert</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <!-- Actions Rapides -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Pompes -->
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <mat-icon class="text-blue-500">water_damage</mat-icon>
              Gestion des Pompes
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <p class="text-gray-600 mb-4">
              Gérer les pompes d'irrigation de votre exploitation
            </p>
            <div class="flex flex-wrap gap-2">
              <button mat-raised-button color="primary" [routerLink]="['/equipements/pompes']">
                Voir toutes les pompes
              </button>
              <button mat-raised-button color="accent" [routerLink]="['/equipements/pompes/nouveau']">
                Ajouter une pompe
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Capteurs -->
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <mat-icon class="text-green-500">sensors</mat-icon>
              Gestion des Capteurs
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <p class="text-gray-600 mb-4">
              Gérer les capteurs connectés de votre exploitation
            </p>
            <div class="flex flex-wrap gap-2">
              <button mat-raised-button color="primary" [routerLink]="['/equipements/capteurs']">
                Voir tous les capteurs
              </button>
              <button mat-raised-button color="accent" [routerLink]="['/equipements/capteurs/nouveau']">
                Ajouter un capteur
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Instructions -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Instructions</mat-card-title>
          <mat-card-subtitle>Comment utiliser le service d'équipements</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <mat-icon class="text-blue-500 mt-1">info</mat-icon>
              <div>
                <p class="font-medium">1. Ajouter des équipements</p>
                <p class="text-sm text-gray-600">Utilisez les formulaires pour ajouter de nouvelles pompes ou capteurs</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <mat-icon class="text-green-500 mt-1">settings</mat-icon>
              <div>
                <p class="font-medium">2. Gérer les états</p>
                <p class="text-sm text-gray-600">Changez l'état des pompes et mettez à jour la communication des capteurs</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <mat-icon class="text-purple-500 mt-1">verified_user</mat-icon>
              <div>
                <p class="font-medium">3. Vérifier les accès</p>
                <p class="text-sm text-gray-600">Vérifiez quels agriculteurs ont accès à quels équipements</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EquipementDashboardComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private snackBar = inject(MatSnackBar);

  healthStatus: string = 'UNKNOWN';
  healthMessage: string = '';
  pompesCount: number = 0;
  capteursCount: number = 0;
  activePompesCount: number = 0;
  lowBatteryCount: number = 0;

  ngOnInit() {
   
    this.loadStats();
  }

  

  loadStats() {
    // Charger les statistiques des pompes
    this.equipementService.getPompesByExploitation(1).subscribe({
      next: (pompes) => {
        this.pompesCount = pompes.length;
        this.activePompesCount = pompes.filter(p => p.etat === 'ACTIF').length;
      },
      error: (error) => {
        console.error('Erreur chargement pompes:', error);
      }
    });

    // Charger les statistiques des capteurs
    this.equipementService.getCapteursByExploitation(1).subscribe({
      next: (capteurs) => {
        this.capteursCount = capteurs.length;
        this.lowBatteryCount = capteurs.filter(c => c.batterie < 20).length;
      },
      error: (error) => {
        console.error('Erreur chargement capteurs:', error);
      }
    });
  }
}