import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
    {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'agriculteurs',
    loadChildren: () => import('./agriculteurs/agriculteurs.routes').then(m => m.AGRICULTEURS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'equipements',
    loadChildren: () => import('./equipements/equipements.routes').then(m => m.EQUIPEMENTS_ROUTES),
    canActivate: [authGuard]
  },
   {
    path: 'supervision',
    loadChildren: () => import('./supervision/supervision.routes').then(m => m.SUPERVISION_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
  
];