import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlumnoService } from '../../core/services/alumno.service';
import { CicloService } from '../../core/services/ciclo.service';
import { TURNOS } from '../../core/models/alumno.model';
import { OpcionNivel } from '../../core/models/curso.model';
import { Ciclo } from '../../core/models/ciclo.model';

@Component({
  selector: 'app-alumno-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>{{ id() ? 'Editar alumno' : 'Nuevo alumno' }}</h2>
      <a routerLink="/alumnos"><button class="btn-secundario">Volver</button></a>
    </div>

    <form class="tarjeta" style="max-width:640px" [formGroup]="form" (ngSubmit)="guardar()">
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
        <label for="dni">DNI</label>
        <input id="dni" formControlName="dni" maxlength="8" />
        @if (invalido('dni')) { <p class="error">El DNI debe tener 8 dígitos.</p> }
      </div>

      <div class="campo">
        <label for="email">Correo</label>
        <input id="email" type="email" formControlName="email" />
        @if (invalido('email')) { <p class="error">Correo no válido.</p> }
      </div>

      <div class="campo">
        <label for="celular">Celular</label>
        <input id="celular" formControlName="celular" maxlength="9" />
      </div>

      <div class="campo">
        <label for="nombrePadre">Nombre del padre/madre</label>
        <input id="nombrePadre" formControlName="nombrePadre" />
      </div>

      <div class="campo">
        <label for="telefonoPadre">Teléfono del padre/madre</label>
        <input id="telefonoPadre" formControlName="telefonoPadre" maxlength="9" />
      </div>

      <div class="campo">
        <label for="nivel">Nivel</label>
        <select id="nivel" formControlName="nivel" (ngModelChange)="alCambiarNivel()">
          <option [ngValue]="null" disabled>Selecciona…</option>
          @for (n of niveles(); track n.valor) {
            <option [ngValue]="n.valor">{{ n.etiqueta }}</option>
          }
        </select>
      </div>

      <div class="campo">
        <label for="area">Área / grado</label>
        <select id="area" formControlName="area">
          <option [ngValue]="null" disabled>Selecciona…</option>
          @for (a of areasDisponibles(); track a) {
            <option [ngValue]="a">{{ a }}</option>
          }
        </select>
        @if (invalido('area')) { <p class="error">El área es obligatoria.</p> }
      </div>

      @if (!id()) {
        <hr />
        <h3>Matrícula inicial</h3>
        <div class="campo">
          <label for="cicloId">Ciclo</label>
          <select id="cicloId" formControlName="cicloId">
            <option [ngValue]="null">— No matricular todavía —</option>
            @for (c of ciclos(); track c.id) {
              <option [ngValue]="c.id">{{ c.nombre }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label for="turno">Turno</label>
          <select id="turno" formControlName="turno">
            <option [ngValue]="null">Selecciona…</option>
            @for (t of turnos; track t.valor) {
              <option [ngValue]="t.valor">{{ t.etiqueta }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label for="montoMatricula">Monto matrícula (opcional)</label>
          <input id="montoMatricula" type="number" step="0.01" formControlName="montoMatricula" />
        </div>
        <div class="campo">
          <label for="montoPension">Monto pensión mensual (opcional)</label>
          <input id="montoPension" type="number" step="0.01" formControlName="montoPension" />
        </div>
      }

      @if (error()) { <p class="error">{{ error() }}</p> }

      <button type="submit" [disabled]="form.invalid || guardando()">
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `
})
export class AlumnoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(AlumnoService);
  private cicloService = inject(CicloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  niveles = signal<OpcionNivel[]>([]);
  areasDisponibles = signal<string[]>([]);
  ciclos = signal<Ciclo[]>([]);
  turnos = TURNOS;
  guardando = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    email: ['', [Validators.email]],
    celular: [''],
    nombrePadre: [''],
    telefonoPadre: [''],
    nivel: ['PREUNIVERSITARIO' as string | null, Validators.required],
    area: [null as string | null, Validators.required],
    cicloId: [null as number | null],
    turno: [null as string | null],
    montoMatricula: [null as number | null],
    montoPension: [null as number | null]
  });

  ngOnInit(): void {
    this.service.niveles().subscribe((n) => this.niveles.set(n));
    this.cicloService.todos().subscribe((c) => this.ciclos.set(c.filter((x) => x.activo)));
    this.alCambiarNivel();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obtener(id).subscribe((a) => {
        this.form.patchValue({
          nombre: a.nombre,
          apellido: a.apellido,
          dni: a.dni,
          email: a.email ?? '',
          celular: a.celular ?? '',
          nombrePadre: a.nombrePadre ?? '',
          telefonoPadre: a.telefonoPadre ?? '',
          nivel: a.nivel,
          area: a.area
        });
        this.alCambiarNivel();
      });
    }
  }

  alCambiarNivel(): void {
    const nivel = this.form.get('nivel')!.value as any;
    if (!nivel) return;
    this.service.areas(nivel).subscribe((a) => this.areasDisponibles.set(a));
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

    const req: any = {
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni,
      email: v.email || null,
      celular: v.celular || null,
      nombrePadre: v.nombrePadre || null,
      telefonoPadre: v.telefonoPadre || null,
      area: v.area,
      nivel: v.nivel
    };

    if (!this.id() && v.cicloId && v.turno) {
      req.matriculaInicial = {
        cicloId: v.cicloId,
        turno: v.turno,
        area: v.area,
        montoMatricula: v.montoMatricula,
        montoPension: v.montoPension
      };
    }

    const peticion = this.id() ? this.service.actualizar(this.id()!, req) : this.service.crear(req);
    peticion.subscribe({
      next: () => this.router.navigate(['/alumnos']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el alumno.');
        this.guardando.set(false);
      }
    });
  }
}
