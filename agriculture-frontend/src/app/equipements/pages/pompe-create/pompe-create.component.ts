// equipements/pages/pompe-create/pompe-create.component.ts
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
import { EquipementService } from '../../../core/services/equipement.service'; 

@Component({
  selector: 'app-pompe-create',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
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
        <h1 class="text-3xl font-bold text-gray-800">Nouvelle Pompe</h1>
        <p class="text-gray-600">Ajoutez une nouvelle pompe d'irrigation</p>
      </div>

      <mat-card>
        <mat-card-content class="p-6">
          <form [formGroup]="pompeForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Informations de base -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Modèle -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Modèle de la pompe</mat-label>
                <input matInput formControlName="modele" placeholder="Ex: XP-2000">
                <mat-error *ngIf="pompeForm.get('modele')?.hasError('required')">
                  Le modèle est requis
                </mat-error>
              </mat-form-field>

              <!-- Exploitation ID -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>ID de l'exploitation</mat-label>
                <input matInput type="number" formControlName="exploitationId" placeholder="Ex: 1">
                <mat-error *ngIf="pompeForm.get('exploitationId')?.hasError('required')">
                  L'ID de l'exploitation est requis
                </mat-error>
              </mat-form-field>
            </div>

            <!-- État et débit -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- État -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>État initial</mat-label>
                <mat-select formControlName="etat">
                  <mat-option value="ACTIF">Actif</mat-option>
                  <mat-option value="INACTIF">Inactif</mat-option>
                </mat-select>
                <mat-error *ngIf="pompeForm.get('etat')?.hasError('required')">
                  L'état est requis
                </mat-error>
              </mat-form-field>

              <!-- Débit max -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Débit maximum (L/min)</mat-label>
                <input matInput type="number" formControlName="debitMax" placeholder="Ex: 100">
                <mat-error *ngIf="pompeForm.get('debitMax')?.hasError('required')">
                  Le débit maximum est requis
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-4">
              <button 
                mat-button 
                type="button"
                [routerLink]="['/equipements/pompes']"
              >
                Annuler
              </button>
              <button 
                mat-raised-button 
                color="primary"
                type="submit"
                [disabled]="pompeForm.invalid || loading"
              >
                <span *ngIf="!loading">Créer la pompe</span>
                <span *ngIf="loading">Création en cours...</span>
                <mat-icon *ngIf="loading" class="ml-2">
                  <mat-spinner diameter="20"></mat-spinner>
                </mat-icon>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Informations -->
      <mat-card class="mt-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon class="text-blue-500">info</mat-icon>
            Informations
          </mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <p class="text-gray-600">
            Les pompes créées seront automatiquement associées à l'exploitation spécifiée.
            Vous pourrez ensuite modifier leur état et consulter leurs détails.
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PompeCreateComponent {
  private fb = inject(FormBuilder);
  private equipementService = inject(EquipementService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;
  
  pompeForm = this.fb.group({
    modele: ['', Validators.required],
    exploitationId: [1, Validators.required],
    etat: ['ACTIF', Validators.required],
    debitMax: [100, Validators.required]
  });

  onSubmit() {
    if (this.pompeForm.valid) {
      this.loading = true;
      
      const pompeData = {
        ...this.pompeForm.value,
        // Ajouter des champs par défaut si nécessaire
        nom: `Pompe ${this.pompeForm.value.modele}`,
        derniereMiseAJour: new Date().toISOString()
      };

      this.equipementService.createPompe(pompeData).subscribe({
        next: (pompe) => {
          this.loading = false;
          this.snackBar.open('Pompe créée avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/equipements/pompes', pompe.id]);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la création de la pompe:', error);
          this.snackBar.open('Erreur lors de la création de la pompe', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}