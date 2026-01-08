// equipements/pages/capteur-create/capteur-create.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EquipementService } from '../../../core/services/equipement.service'; 

@Component({
  selector: 'app-capteur-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
 
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button 
          mat-button 
          color="primary"
          [routerLink]="['/equipements/capteurs']"
          class="mb-4"
        >
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
        <h1 class="text-3xl font-bold text-gray-800">Nouveau Capteur</h1>
        <p class="text-gray-600">Ajoutez un nouveau capteur connecté</p>
      </div>

      <mat-card>
        <mat-card-content class="p-6">
          <form [formGroup]="capteurForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Type de capteur -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type de capteur</mat-label>
              <mat-select formControlName="type">
                <mat-option value="HUMIDITE">Humidité</mat-option>
                <mat-option value="TEMPERATURE">Température</mat-option>
                <mat-option value="PH">pH</mat-option>
                <mat-option value="LUMINOSITE">Luminosité</mat-option>
                <mat-option value="PRESSION">Pression</mat-option>
                <mat-option value="AUTRE">Autre</mat-option>
              </mat-select>
              <mat-error *ngIf="capteurForm.get('type')?.hasError('required')">
                Le type est requis
              </mat-error>
            </mat-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Exploitation ID -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>ID de l'exploitation</mat-label>
                <input matInput type="number" formControlName="exploitationId" placeholder="Ex: 1">
                <mat-error *ngIf="capteurForm.get('exploitationId')?.hasError('required')">
                  L'ID de l'exploitation est requis
                </mat-error>
              </mat-form-field>

              <!-- Niveau de batterie -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Niveau de batterie (%)</mat-label>
                <input matInput type="number" min="0" max="100" formControlName="batterie" placeholder="Ex: 85">
                <mat-hint>Valeur entre 0 et 100</mat-hint>
                <mat-error *ngIf="capteurForm.get('batterie')?.hasError('required')">
                  Le niveau de batterie est requis
                </mat-error>
                <mat-error *ngIf="capteurForm.get('batterie')?.hasError('min')">
                  Minimum 0%
                </mat-error>
                <mat-error *ngIf="capteurForm.get('batterie')?.hasError('max')">
                  Maximum 100%
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Dernière communication (optionnelle) -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Dernière communication</mat-label>
              <input matInput type="datetime-local" formControlName="derniereCommunication">
              <mat-hint>Laisser vide pour utiliser la date actuelle</mat-hint>
            </mat-form-field>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-4">
              <button 
                mat-button 
                type="button"
                [routerLink]="['/equipements/capteurs']"
              >
                Annuler
              </button>
              <button 
                mat-raised-button 
                color="primary"
                type="submit"
                [disabled]="capteurForm.invalid || loading"
              >
                <span *ngIf="!loading">Créer le capteur</span>
                <span *ngIf="loading">Création en cours...</span>
                <mat-icon *ngIf="loading" class="ml-2">
                  <mat-spinner diameter="20"></mat-spinner>
                </mat-icon>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Types de capteurs -->
      <div class="mt-6">
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <mat-icon class="text-green-500">info</mat-icon>
              Types de capteurs disponibles
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <mat-icon class="text-blue-500">water_drop</mat-icon>
                <div>
                  <p class="font-medium">Humidité</p>
                  <p class="text-sm text-gray-600">Mesure l'humidité du sol</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <mat-icon class="text-red-500">thermostat</mat-icon>
                <div>
                  <p class="font-medium">Température</p>
                  <p class="text-sm text-gray-600">Mesure la température ambiante</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <mat-icon class="text-green-500">science</mat-icon>
                <div>
                  <p class="font-medium">pH</p>
                  <p class="text-sm text-gray-600">Mesure l'acidité du sol</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <mat-icon class="text-yellow-500">wb_sunny</mat-icon>
                <div>
                  <p class="font-medium">Luminosité</p>
                  <p class="text-sm text-gray-600">Mesure l'intensité lumineuse</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class CapteurCreateComponent {
  private fb = inject(FormBuilder);
  private equipementService = inject(EquipementService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;
  
  capteurForm = this.fb.group({
    type: ['HUMIDITE', Validators.required],
    exploitationId: [1, Validators.required],
    batterie: [85, [Validators.required, Validators.min(0), Validators.max(100)]],
    derniereCommunication: ['']
  });

  onSubmit() {
    if (this.capteurForm.valid) {
      this.loading = true;
      
      const capteurData = {
        ...this.capteurForm.value,
        derniereCommunication: this.capteurForm.value.derniereCommunication 
          ? this.capteurForm.value.derniereCommunication 
          : new Date().toISOString()
      };

      this.equipementService.createCapteur(capteurData).subscribe({
        next: (capteur) => {
          this.loading = false;
          this.snackBar.open('Capteur créé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/equipements/capteurs', capteur.id]);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la création du capteur:', error);
          this.snackBar.open('Erreur lors de la création du capteur', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}