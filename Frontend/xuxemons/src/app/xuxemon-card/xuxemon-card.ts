import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';
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
  imagenConError = false;

  constructor(private gameConfigService: GameConfigService) {}

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

  get tamanoClase(): string {
    const tamano = (this.xuxemon?.tamano || 'Pequeño').toLowerCase();

    if (tamano === 'grande') {
      return 'tamano-render-grande';
    }

    if (tamano === 'mediano') {
      return 'tamano-render-mediano';
    }

    return 'tamano-render-pequeno';
  }

  get imagenMostrada(): string {
    if (!this.xuxemon) {
      return '';
    }

    const imagenBase = this.xuxemon.imagen || `/imagenes/assets/${this.xuxemon.id}.png`;

    if (this.imagenConError) {
      return imagenBase;
    }

    const tamano = (this.xuxemon.tamano || 'Pequeño').toLowerCase();

    if (tamano === 'grande') {
      return this.crearRutaPorTamano(imagenBase, 'grande');
    }

    if (tamano === 'pequeño') {
      return this.crearRutaPorTamano(imagenBase, 'pequeno');
    }

    return imagenBase;
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
    const base = this.getEvolveBase();
    if (tamano === 'pequeño') return base;  // Pequeño -> Mediano
    if (tamano === 'mediano') return base + 2;  // Mediano -> Grande
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

  onImageError(): void {
    this.imagenConError = true;
  }

  private crearRutaPorTamano(imagenBase: string, tamano: 'pequeno' | 'grande'): string {
    const indicePunto = imagenBase.lastIndexOf('.');

    if (indicePunto === -1) {
      return `${imagenBase}-${tamano}-ia.png`;
    }

    const nombre = imagenBase.substring(0, indicePunto);
    const extension = imagenBase.substring(indicePunto);

    return `${nombre}-${tamano}-ia${extension}`;
  }

  private getEvolveBase(): number {
    const base = this.gameConfigService.snapshot.evolve_xuxes;
    return base > 0 ? base : 3;
  }
}
