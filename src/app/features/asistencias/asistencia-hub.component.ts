import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-asistencia-hub',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="barra-superior"><h2>Asistencia</h2></div>
    <div class="entity-grid">
      <a routerLink="/asistencias/estudiantes" class="tarjeta entity-card">
        <h3>Ingreso de estudiantes</h3>
        <p>Registro de entrada a la institución por código/DNI.</p>
      </a>
      <a routerLink="/asistencias/docentes" class="tarjeta entity-card">
        <h3>Llegada de docentes</h3>
        <p>Marcar llegada según el horario del día.</p>
      </a>
      <a routerLink="/asistencias/cursos" class="tarjeta entity-card">
        <h3>Asistencia por curso</h3>
        <p>Histórico ligado a los horarios de clase.</p>
      </a>
    </div>
  `,
  styles: [`
    .entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .entity-card { cursor: pointer; }
  `]
})
export class AsistenciaHubComponent {}
