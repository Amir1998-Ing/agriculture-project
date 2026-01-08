import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AgriculteurService } from '../../../core/services/agriculteur.service';
import { Agriculteur } from '../../../core/models/agriculteur.model';
import { AgriculteurExploitationsComponent } from '../agriculteur-exploitations/agriculteur-exploitations.component';

@Component({
  selector: 'app-agriculteur-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AgriculteurExploitationsComponent],
  templateUrl: './agriculteur-detail.component.html',
  styleUrls: ['./agriculteur-detail.component.css']
})
export class AgriculteurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(AgriculteurService);

  agriculteur: Agriculteur | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/agriculteurs/list']);
      return;
    }
    this.load(+id);
  }

  load(id: number): void {
    this.loading = true;
    this.service.getAgriculteurById(id).subscribe({
      next: (a) => { this.agriculteur = a; this.loading = false; },
      error: (err) => { console.error(err); this.error = 'Erreur lors du chargement.'; this.loading = false; }
    });
  }

  edit(): void {
    if (this.agriculteur) this.router.navigate(['/agriculteurs/edit', this.agriculteur.id]);
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
