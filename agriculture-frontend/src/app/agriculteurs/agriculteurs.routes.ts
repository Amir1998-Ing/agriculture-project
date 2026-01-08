import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const AGRICULTEURS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/agriculteur-list/agriculteur-list.component')
      .then(m => m.AgriculteurListComponent),
    title: 'Liste des agriculteurs'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/agriculteur-form/agriculteur-form.component')
      .then(m => m.AgriculteurFormComponent),
    title: 'Créer un agriculteur'
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./pages/agriculteur-detail/agriculteur-detail.component')
      .then(m => m.AgriculteurDetailComponent),
    title: 'Détail agriculteur'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/agriculteur-form/agriculteur-form.component')
      .then(m => m.AgriculteurFormComponent),
    title: 'Modifier un agriculteur'
  },
  
];