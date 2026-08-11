import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CursoService } from '../../core/services/curso.service';
import { OpcionNivel } from '../../core/models/curso.model';

@Component({
  selector: 'app-curso-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>{{ id() ? 'Editar curso' : 'Nuevo curso' }}</h2>
      <a routerLink="/cursos"><button class="btn-secundario">Volver</button></a>
    </div>

    <form class="tarjeta" style="max-width:560px" [formGroup]="form" (ngSubmit)="guardar()">
      <div class="campo">
        <label for="codigo">Código</label>
        <input id="codigo" formControlName="codigo" />
        @if (invalido('codigo')) { <p class="error">El código es obligatorio (máx. 20).</p> }
      </div>

      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" formControlName="nombre" />
        @if (invalido('nombre')) { <p class="error">El nombre debe tener entre 2 y 80 caracteres.</p> }
      </div>

      <div class="campo">
        <label for="horas">Horas</label>
        <input id="horas" type="number" formControlName="horas" />
        @if (invalido('horas')) { <p class="error">Las horas deben estar entre 1 y 40.</p> }
      </div>

      <div class="campo">
        <label for="nivel">Nivel</label>
        <select id="nivel" formControlName="nivel">
          <option [ngValue]="null" disabled>Selecciona…</option>
          @for (n of niveles(); track n.valor) {
            <option [ngValue]="n.valor">{{ n.etiqueta }}</option>
          }
        </select>
        @if (invalido('nivel')) { <p class="error">El nivel es obligatorio.</p> }
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
export class CursoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  niveles = signal<OpcionNivel[]>([]);
  guardando = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    horas: [null as number | null, [Validators.required, Validators.min(1), Validators.max(40)]],
    nivel: [null as string | null, Validators.required],
    profesorId: [null as number | null],
    destacadoWeb: [false]
  });

  ngOnInit(): void {
    this.service.niveles().subscribe((n) => this.niveles.set(n));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obtener(id).subscribe((c) => {
        this.form.patchValue({
          codigo: c.codigo,
          nombre: c.nombre,
          horas: c.horas,
          nivel: c.nivel,
          profesorId: c.profesorId,
          destacadoWeb: c.destacadoWeb
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
    const valor = this.form.getRawValue();
    const peticion = this.id()
      ? this.service.actualizar(this.id()!, valor as any)
      : this.service.crear(valor as any);

    peticion.subscribe({
      next: () => this.router.navigate(['/cursos']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el curso.');
        this.guardando.set(false);
      }
    });
  }
}
