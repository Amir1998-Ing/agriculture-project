// equipements/equipements.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EQUIPEMENTS_ROUTES } from './equipements.routes';

// Import des composants (standalone)
import { EquipementDashboardComponent } from './pages/equipement-dashboard/equipement-dashboard.component';
import { PompesListComponent } from './pages/pompes-list/pompes-list.component';
import { PompeCreateComponent } from './pages/pompe-create/pompe-create.component';
import { PompeDetailComponent } from './pages/pompe-detail/pompe-detail.component';
import { CapteursListComponent } from './pages/capteur-list/capteurs-list.component'; 
import { CapteurCreateComponent } from './pages/capteur-create/capteur-create.component';
import { CapteurDetailComponent } from './pages/capteur-detail/capteur-detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EQUIPEMENTS_ROUTES),
    // Import des composants standalone
    EquipementDashboardComponent,
    PompesListComponent,
    PompeCreateComponent,
    PompeDetailComponent,
    CapteursListComponent,
    CapteurCreateComponent,
    CapteurDetailComponent
  ]
})
export class EquipementsModule { }