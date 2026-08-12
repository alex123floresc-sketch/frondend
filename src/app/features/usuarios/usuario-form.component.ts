import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioAdminService } from '../../core/services/usuario-admin.service';
import { RolOpcion } from '../../core/models/usuario-admin.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>{{ id() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
      <a routerLink="/usuarios"><button class="btn-secundario">Volver</button></a>
    </div>

    <form class="tarjeta" style="max-width:480px" [formGroup]="form" (ngSubmit)="guardar()">
      <div class="campo">
        <label for="username">Usuario</label>
        <input id="username" formControlName="username" />
        @if (invalido('username')) { <p class="error">El usuario debe tener entre 3 y 30 caracteres.</p> }
      </div>

      <div class="campo">
        <label for="nombre">Nombre completo</label>
        <input id="nombre" formControlName="nombre" />
        @if (invalido('nombre')) { <p class="error">El nombre debe tener entre 2 y 60 caracteres.</p> }
      </div>

      <div class="campo">
        <label for="passwordPlano">{{ id() ? 'Nueva contraseña (dejar en blanco para no cambiarla)' : 'Contraseña' }}</label>
        <input id="passwordPlano" type="password" formControlName="passwordPlano" />
      </div>

      <div class="campo">
        <label for="rolId">Rol</label>
        <select id="rolId" formControlName="rolId">
          <option [ngValue]="null" disabled>Selecciona…</option>
          @for (r of roles(); track r.id) {
            <option [ngValue]="r.id">{{ r.nombre }}</option>
          }
        </select>
        @if (invalido('rolId')) { <p class="error">Debes seleccionar un rol.</p> }
      </div>

      <div class="campo">
        <label><input type="checkbox" formControlName="activo" style="width:auto" /> Usuario activo</label>
      </div>

      @if (error()) { <p class="error">{{ error() }}</p> }

      <button type="submit" [disabled]="form.invalid || guardando()">
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </form>
  `
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UsuarioAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roles = signal<RolOpcion[]>([]);
  guardando = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    passwordPlano: [''],
    rolId: [null as number | null, Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    this.service.roles().subscribe((r) => this.roles.set(r));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.id.set(id);
      this.service.obtener(id).subscribe((u) => {
        const rol = this.roles().find((r) => u.roles.includes(r.nombre));
        this.form.patchValue({
          username: u.username,
          nombre: u.nombre,
          activo: u.activo,
          rolId: rol ? rol.id : null
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
    if (!this.id() && !this.form.value.passwordPlano) {
      this.error.set('La contraseña es obligatoria al crear un usuario.');
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const req: any = { ...v, passwordPlano: v.passwordPlano || null };

    const peticion = this.id() ? this.service.actualizar(this.id()!, req) : this.service.crear(req);
    peticion.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo guardar el usuario.');
        this.guardando.set(false);
      }
    });
  }
}
