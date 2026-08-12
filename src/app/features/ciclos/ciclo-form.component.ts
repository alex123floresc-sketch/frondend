import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CicloService } from '../../core/services/ciclo.service';

@Component({
  selector: 'app-ciclo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>{{ id() ? 'Editar ciclo' : 'Nuevo ciclo' }}</h2>
      <a routerLink="/ciclos"><button class="btn-secundario">Volver</button></a>
    </div>

    <form class="tarjeta" style="max-width:480px" [formGroup]="form" (ngSubmit)="guardar()">
      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" formControlName="nombre" placeholder="Ej: 2026-I" />
        @if (invalido('nombre')) { <p class="error">El nombre debe tener entre 3 y 60 caracteres.</p> }
      </div>

      <div class="campo">
        <label for="fechaInicio">Fecha de inicio</label>
        <input id="fechaInicio" type="date" formControlName="fechaInicio" />
        @if (invalido('fechaInicio')) { <p class="error">La fecha de inicio es obligatoria.</p> }
      </div>

      <div class="campo">
        <label for="fechaFin">Fecha de fin</label>
        <input id="fechaFin" type="date" formControlName="fechaFin" />
        @if (invalido('fechaFin')) { <p class="error">La fecha de fin es obligatoria y debe ser posterior al inicio.</p> }
      </div>

      <div class="campo">
        <label><input type="checkbox" formControlName="activo" style="width:auto" /> Ciclo activo</label>
      </div>

      @if (error()) { <p class="error">{{ error() }}</p> }

      <button type="submit" [disabled]="form.invalid || guardando()">
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `
})
export class CicloFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guardando = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    activo: [false]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obtener(id).subscribe((c) => {
        this.form.patchValue({
          nombre: c.nombre,
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
          activo: c.activo
        });
      });
    }
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const peticion = this.id() ? this.service.actualizar(this.id()!, v) : this.service.crear(v);
    peticion.subscribe({
      next: () => this.router.navigate(['/ciclos']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el ciclo.');
        this.guardando.set(false);
      }
    });
  }
}
