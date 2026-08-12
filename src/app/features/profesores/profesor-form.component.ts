import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfesorService } from '../../core/services/profesor.service';
import { Nivel } from '../../core/models/curso.model';

const TODOS_LOS_NIVELES: Nivel[] = ['PRIMARIA', 'SECUNDARIA', 'PREUNIVERSITARIO'];

@Component({
  selector: 'app-profesor-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>{{ id() ? 'Editar profesor' : 'Nuevo profesor' }}</h2>
      <a routerLink="/profesores"><button class="btn-secundario">Volver</button></a>
    </div>

    <form class="tarjeta" style="max-width:560px" [formGroup]="form" (ngSubmit)="guardar()">
      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" formControlName="nombre" />
        @if (invalido('nombre')) { <p class="error">El nombre es obligatorio (2-50 caracteres).</p> }
      </div>

      <div class="campo">
        <label for="apellido">Apellido</label>
        <input id="apellido" formControlName="apellido" />
        @if (invalido('apellido')) { <p class="error">El apellido es obligatorio (2-50 caracteres).</p> }
      </div>

      <div class="campo">
        <label for="email">Correo</label>
        <input id="email" type="email" formControlName="email" />
        @if (invalido('email')) { <p class="error">Correo obligatorio y válido.</p> }
      </div>

      <div class="campo">
        <label for="especialidad">Especialidad</label>
        <input id="especialidad" formControlName="especialidad" />
      </div>

      <div class="campo">
        <label for="tarifaHora">Tarifa por hora (S/)</label>
        <input id="tarifaHora" type="number" step="0.01" formControlName="tarifaHora" />
      </div>

      <div class="campo">
        <label>Niveles en los que enseña</label>
        @for (n of todosLosNiveles; track n) {
          <label style="display:block;font-weight:400">
            <input type="checkbox" style="width:auto" [checked]="nivelSeleccionado(n)" (change)="alternarNivel(n)" /> {{ n }}
          </label>
        }
      </div>

      <div class="campo">
        <label><input type="checkbox" formControlName="destacadoWeb" style="width:auto" /> Destacar en la web pública</label>
      </div>

      @if (error()) { <p class="error">{{ error() }}</p> }

      <button type="submit" [disabled]="form.invalid || guardando()">
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `
})
export class ProfesorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProfesorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  todosLosNiveles = TODOS_LOS_NIVELES;
  guardando = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);
  niveles = signal<Nivel[]>([]);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    especialidad: [''],
    tarifaHora: [null as number | null],
    destacadoWeb: [false]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obtener(id).subscribe((p) => {
        this.form.patchValue({
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          especialidad: p.especialidad ?? '',
          tarifaHora: p.tarifaHora,
          destacadoWeb: p.destacadoWeb
        });
        this.niveles.set(p.niveles);
      });
    }
  }

  nivelSeleccionado(n: Nivel): boolean {
    return this.niveles().includes(n);
  }

  alternarNivel(n: Nivel): void {
    const actuales = this.niveles();
    this.niveles.set(actuales.includes(n) ? actuales.filter((x) => x !== n) : [...actuales, n]);
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
    const req: any = { ...v, tarifaHora: v.tarifaHora, niveles: this.niveles() };

    const peticion = this.id() ? this.service.actualizar(this.id()!, req) : this.service.crear(req);
    peticion.subscribe({
      next: () => this.router.navigate(['/profesores']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el profesor.');
        this.guardando.set(false);
      }
    });
  }
}
