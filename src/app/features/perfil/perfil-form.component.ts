import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilService } from '../../core/services/perfil.service';
import { Perfil } from '../../core/models/perfil.model';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="barra-superior"><h2>Mi perfil</h2></div>

    @if (perfil(); as p) {
      <div class="tarjeta" style="max-width:560px">
        <p><strong>Usuario:</strong> {{ p.username }}</p>
        <p><strong>Roles:</strong> {{ p.roles.join(', ') }}</p>

        <div class="campo">
          <label>Foto de perfil</label>
          <input type="file" accept="image/*" (change)="subirFoto($event)" />
          @if (p.fotoPresente) { <button class="btn-secundario" (click)="quitarFoto()" style="margin-top:.5rem">Quitar foto</button> }
        </div>

        <div class="campo">
          <label>Firma (para constancias/PDFs)</label>
          <input type="file" accept="image/*" (change)="subirFirma($event)" />
          @if (p.firmaPresente) { <p style="color:var(--color-secundario);font-size:.85rem">Ya tienes una firma registrada.</p> }
        </div>
      </div>

      <form class="tarjeta" style="max-width:560px" [formGroup]="form" (ngSubmit)="guardar()">
        <div class="campo">
          <label for="nombre">Nombre completo</label>
          <input id="nombre" formControlName="nombre" />
          @if (invalido('nombre')) { <p class="error">El nombre debe tener entre 2 y 80 caracteres.</p> }
        </div>

        <div class="campo">
          <label for="email">Correo</label>
          <input id="email" type="email" formControlName="email" />
        </div>

        <div class="campo">
          <label for="telefono">Teléfono</label>
          <input id="telefono" formControlName="telefono" />
        </div>

        <div class="campo">
          <label for="cargo">Cargo</label>
          <input id="cargo" formControlName="cargo" />
        </div>

        <hr />
        <h3>Cambiar contraseña (opcional)</h3>
        <div class="campo">
          <label for="passwordActual">Contraseña actual</label>
          <input id="passwordActual" type="password" formControlName="passwordActual" />
        </div>
        <div class="campo">
          <label for="passwordNueva">Nueva contraseña</label>
          <input id="passwordNueva" type="password" formControlName="passwordNueva" />
        </div>
        <div class="campo">
          <label for="passwordNuevaConfirmar">Confirmar nueva contraseña</label>
          <input id="passwordNuevaConfirmar" type="password" formControlName="passwordNuevaConfirmar" />
        </div>

        @if (mensaje()) { <p [class.error]="!exito()" [style.color]="exito() ? 'green' : ''">{{ mensaje() }}</p> }

        <button type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </form>
    }
  `
})
export class PerfilFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PerfilService);

  perfil = signal<Perfil | null>(null);
  guardando = signal(false);
  mensaje = signal<string | null>(null);
  exito = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: [''],
    telefono: [''],
    cargo: [''],
    passwordActual: [''],
    passwordNueva: [''],
    passwordNuevaConfirmar: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.service.obtener().subscribe((p) => {
      this.perfil.set(p);
      this.form.patchValue({
        nombre: p.nombre,
        email: p.email ?? '',
        telefono: p.telefono ?? '',
        cargo: p.cargo ?? ''
      });
    });
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  subirFoto(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    this.service.subirFoto(archivo).subscribe(() => this.cargar());
  }

  quitarFoto(): void {
    this.service.quitarFoto().subscribe(() => this.cargar());
  }

  subirFirma(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    this.service.subirFirma(archivo).subscribe(() => this.cargar());
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.mensaje.set(null);
    this.service.actualizar(this.form.getRawValue()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(true);
        this.mensaje.set('Perfil actualizado correctamente.');
        this.form.patchValue({ passwordActual: '', passwordNueva: '', passwordNuevaConfirmar: '' });
      },
      error: (err) => {
        this.guardando.set(false);
        this.exito.set(false);
        this.mensaje.set(err?.error?.mensaje ?? 'No se pudo actualizar el perfil.');
      }
    });
  }
}
