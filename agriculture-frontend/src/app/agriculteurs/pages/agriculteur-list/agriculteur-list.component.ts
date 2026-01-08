import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgriculteurService } from '../../../core/services/agriculteur.service';
import { Agriculteur } from '../../../core/models/agriculteur.model';

@Component({
  selector: 'app-agriculteur-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './agriculteur-list.component.html',
  styleUrls: ['./agriculteur-list.component.css']
})
export class AgriculteurListComponent implements OnInit {
  agriculteurs: Agriculteur[] = [];
  filteredAgriculteurs: Agriculteur[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Statistiques
  totalAgriculteurs: number = 0;
  adminCount: number = 0;
  agriculteurCount: number = 0;
  superviseurCount: number = 0;

  constructor(private agriculteurService: AgriculteurService) {}

  ngOnInit(): void {
    this.loadAgriculteurs();
  }

  loadAgriculteurs(): void {
    this.loading = true;
    this.error = '';
    
    this.agriculteurService.getAllAgriculteurs().subscribe({
      next: (data) => {
        this.agriculteurs = data;
        this.filteredAgriculteurs = [...data];
        this.totalItems = data.length;
        this.calculateStatistics(); // Calculer les statistiques
        this.loading = false;
        console.log('Agriculteurs chargés:', data.length);
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des agriculteurs';
        this.loading = false;
        console.error('Erreur:', error);
        
        // Données de démonstration en cas d'erreur
        this.loadDemoData();
      }
    });
  }

  loadDemoData(): void {
    this.agriculteurs = [
      {
        id: 1,
        nom: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        telephone: '0123456789',
        role: 'AGRICULTEUR',
        dateInscription: '2024-01-01',
        exploitations: []
      },
      {
        id: 2,
        nom: 'Marie Martin',
        email: 'marie.martin@example.com',
        telephone: '0987654321',
        role: 'AGRICULTEUR',
        dateInscription: '2024-01-02',
        exploitations: []
      },
      {
        id: 3,
        nom: 'Pierre Durand',
        email: 'pierre.durand@example.com',
        telephone: '0654321890',
        role: 'ADMIN',
        dateInscription: '2024-01-03',
        exploitations: []
      }
    ];
    this.filteredAgriculteurs = [...this.agriculteurs];
    this.totalItems = this.agriculteurs.length;
    this.calculateStatistics(); // Calculer les statistiques aussi pour les données de démo
  }

  // Méthode pour calculer les statistiques
  calculateStatistics(): void {
    this.totalAgriculteurs = this.agriculteurs.length;
    this.agriculteurCount = this.agriculteurs.filter(a => a.role === 'AGRICULTEUR').length;
    this.adminCount = this.agriculteurs.filter(a => a.role === 'ADMIN').length;
    this.superviseurCount = this.agriculteurs.filter(a => a.role === 'SUPERVISEUR').length;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAgriculteurs = [...this.agriculteurs];
      this.totalItems = this.agriculteurs.length;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAgriculteurs = this.agriculteurs.filter(agriculteur =>
        agriculteur.nom.toLowerCase().includes(term) ||
        agriculteur.email.toLowerCase().includes(term) ||
        agriculteur.telephone?.toLowerCase().includes(term)
      );
      this.totalItems = this.filteredAgriculteurs.length;
    }
    
    // Réinitialiser la pagination
    this.currentPage = 1;
    // Recalculer les statistiques si nécessaire (les statistiques restent sur tous les agriculteurs, pas seulement ceux filtrés)
  }

  deleteAgriculteur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agriculteur ?')) {
      this.agriculteurService.deleteAgriculteur(id).subscribe({
        next: () => {
          this.agriculteurs = this.agriculteurs.filter(a => a.id !== id);
          this.filteredAgriculteurs = this.filteredAgriculteurs.filter(a => a.id !== id);
          this.totalItems = this.filteredAgriculteurs.length;
          this.calculateStatistics(); // Recalculer les statistiques après suppression
          alert('Agriculteur supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  get paginatedAgriculteurs(): Agriculteur[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAgriculteurs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'ADMIN': return 'bg-danger';
      case 'AGRICULTEUR': return 'bg-success';
      case 'SUPERVISEUR': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'AGRICULTEUR': return 'Agriculteur';
      case 'SUPERVISEUR': return 'Superviseur';
      default: return role;
    }
  }
}