import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IXuxemon } from '../models/xuxemon.interface';
@Component({
  selector: 'app-xuxemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xuxemon-card.html',
  styleUrl: './xuxemon-card.css'
})
export class XuxemonCardComponent {

  @Input() xuxemon!: IXuxemon;
  @Input() xuxesDisponibles: number = 0;
  @Output() evolucionar$ = new EventEmitter<{xuxemonId: number, nuevoTamano: string, coste: number}>();

  evolucionando: boolean = false;

  get tipoIcono(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return '?';
    switch (this.xuxemon.tipo.toLowerCase()) {
      case 'agua': return '💧';
      case 'tierra': return '🪨';
      case 'aire': return '💨';
      default: return '⚪';
    }
  }

  get tipoNombre(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'Desconocido';
    const tipo = this.xuxemon.tipo;
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  get tipoClase(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'tipo-desconocido';
    return 'tipo-' + this.xuxemon.tipo.toLowerCase();
  }

  getStatValue(stat: string): number {
    if (!this.xuxemon) return 50;
    const semilla = this.xuxemon.id * 31;
    switch (stat) {
      case 'vida': return 40 + (semilla % 61);
      case 'ataque': return 30 + ((semilla * 7) % 71);
      case 'defensa': return 35 + ((semilla * 13) % 66);
      case 'velocidad': return 25 + ((semilla * 19) % 76);
      default: return 50;
    }
  }

  // Calcula cuántas xuxes necesita para evolucionar
  get xuxesNecesarias(): number {
    if (!this.xuxemon) return 0;
    const tamano = this.xuxemon.tamano?.toLowerCase();
    if (tamano === 'pequeño') return 3;  // Pequeño -> Mediano
    if (tamano === 'mediano') return 5;  // Mediano -> Grande
    return 0; // Grande ya no evoluciona
  }

  // Comprueba si puede evolucionar
  get puedeEvolucionar(): boolean {
    return this.xuxesNecesarias > 0 && this.xuxesDisponibles >= this.xuxesNecesarias;
  }

  // Devuelve el siguiente tamaño
  get siguienteTamano(): string {
    const tamano = this.xuxemon?.tamano?.toLowerCase();
    if (tamano === 'pequeño') return 'Mediano';
    if (tamano === 'mediano') return 'Grande';
    return '';
  }

  // Lanza la evolución con animación
  evolucionar(): void {
    if (!this.puedeEvolucionar || this.evolucionando) return;

    this.evolucionando = true;

    // Esperamos 1.5s (duración de la animación) y luego emitimos el evento
    setTimeout(() => {
      this.evolucionar$.emit({
        xuxemonId: this.xuxemon.id,
        nuevoTamano: this.siguienteTamano,
        coste: this.xuxesNecesarias
      });
      this.evolucionando = false;
    }, 1500);
  }
}