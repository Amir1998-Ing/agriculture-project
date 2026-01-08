import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AgriculteurService } from '../../../core/services/agriculteur.service';
import { Agriculteur, AgriculteurRequest } from '../../../core/models/agriculteur.model';

@Component({
  selector: 'app-agriculteur-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agriculteur-form.component.html',
  styleUrls: ['./agriculteur-form.component.css']
})
export class AgriculteurFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(AgriculteurService);

  agriculteur: Partial<AgriculteurRequest & { id?: number }> = {
    nom: '',
    email: '',
    telephone: '',
    role: 'AGRICULTEUR'
  };

  isEdit = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadAgriculteur(+id);
    }
  }

  loadAgriculteur(id: number): void {
    this.loading = true;
    this.service.getAgriculteurById(id).subscribe({
      next: (a) => {
        this.agriculteur = { id: a.id, nom: a.nom, email: a.email, telephone: a.telephone, role: a.role };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger l\'agriculteur.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  submit(): void {
    this.error = '';
    const payload: AgriculteurRequest = {
      nom: this.agriculteur.nom || '',
      email: this.agriculteur.email || '',
      telephone: this.agriculteur.telephone,
      role: this.agriculteur.role
    };

    this.loading = true;
    if (this.isEdit && this.agriculteur.id) {
      this.service.updateAgriculteur(this.agriculteur.id, payload).subscribe({
        next: () => this.router.navigate(['/agriculteurs/view', this.agriculteur.id]),
        error: (err) => { this.error = 'Erreur lors de la mise à jour.'; console.error(err); this.loading = false; }
      });
    } else {
      this.service.createAgriculteur(payload).subscribe({
        next: (created) => this.router.navigate(['/agriculteurs/view', created.id]),
        error: (err) => { this.error = 'Erreur lors de la création.'; console.error(err); this.loading = false; }
      });
    }
  }
}
