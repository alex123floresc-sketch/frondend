import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="pantalla-login">
      <form class="tarjeta caja-login" [formGroup]="form" (ngSubmit)="entrar()">
        <h1>Lapreplus</h1>
        <p class="subtitulo">Sistema de Matrículas</p>

        <div class="campo">
          <label for="username">Usuario</label>
          <input id="username" formControlName="username" autocomplete="username" />
        </div>

        <div class="campo">
          <label for="password">Contraseña</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || cargando()">
          {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .pantalla-login { min-height: 100vh; display: grid; place-items: center; padding: 1rem;
      background: linear-gradient(135deg, #0B2545, #13315C); }
    .caja-login { width: 100%; max-width: 360px; }
    .subtitulo { margin-top: -.4rem; color: #5A5A5A; font-size: .9rem; }
    button { width: 100%; margin-top: .5rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  entrar(): void {
    if (this.form.invalid) return;
    this.cargando.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo iniciar sesión');
        this.cargando.set(false);
      }
    });
  }
}
