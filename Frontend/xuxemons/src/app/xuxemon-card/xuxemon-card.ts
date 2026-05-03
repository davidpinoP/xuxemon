import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';

@Component({
  selector: 'app-xuxemon-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './xuxemon-card.html',
  styleUrl: './xuxemon-card.css',
  encapsulation: ViewEncapsulation.None
})
export class XuxemonCardComponent implements OnChanges {
  @Input() xuxemon!: IXuxemon;

  private indiceImagenActual = 0;
  private readonly placeholderImage = '/assets/images/xuxemon-mascot.png';

  constructor(private gameConfigService: GameConfigService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xuxemon']) {
      this.indiceImagenActual = 0;
    }
  }

  get tipoIcono(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return '?';

    switch (this.xuxemon.tipo.toLowerCase()) {
      case 'agua':
        return '💧';
      case 'tierra':
        return '🪨';
      case 'aire':
        return '💨';
      default:
        return '⚪';
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

  get estaBloqueado(): boolean {
    return this.xuxemon?.bloqueado === true || this.xuxemon?.desbloqueado === false;
  }

  get imagenAlt(): string {
    const nombre = this.xuxemon?.nombre || 'Xuxemon';

    if (this.estaBloqueado) {
      return `Imagen bloqueada de ${nombre}`;
    }

    return `Imagen de ${nombre}, tipo ${this.tipoNombre}, tamano ${this.getTamanoTexto()}`;
  }

  get estadoTexto(): string {
    if (this.estaBloqueado) {
      return 'Xuxemon bloqueado';
    }

    if (this.enfermedadesTexto) {
      return `Estado: Enfermo - ${this.enfermedadesTexto}`;
    }

    return 'Estado: Sano';
  }

  get tamanoClase(): string {
    const tamano = this.normalizarTamano(this.xuxemon?.tamano);

    if (tamano === 'grande') {
      return 'tamano-render-grande';
    }

    if (tamano === 'mediano') {
      return 'tamano-render-mediano';
    }

    return 'tamano-render-pequeno';
  }

  get imagenMostrada(): string {
    const rutas = this.getRutasImagen();
    return rutas[this.indiceImagenActual] || this.placeholderImage;
  }

  getStatValue(stat: string): number {
    if (!this.xuxemon) return 50;

    const semilla = this.xuxemon.id * 31;

    switch (stat) {
      case 'vida':
        return 40 + (semilla % 61);
      case 'ataque':
        return 30 + ((semilla * 7) % 71);
      case 'defensa':
        return 35 + ((semilla * 13) % 66);
      case 'velocidad':
        return 25 + ((semilla * 19) % 76);
      default:
        return 50;
    }
  }

  get xuxesNecesarias(): number {
    if (!this.xuxemon || this.estaBloqueado) return 0;

    const tamano = this.normalizarTamano(this.xuxemon.tamano);
    const base = this.getEvolveBase();
    const penalizacion = this.tieneBajonAzucar ? 2 : 0;

    if (tamano === 'pequeno') return base + penalizacion;
    if (tamano === 'mediano') return base + 2 + penalizacion;

    return 0;
  }

  get tieneBajonAzucar(): boolean {
    return this.getEnfermedades().includes('Bajón de azúcar');
  }

  get enfermedadesTexto(): string {
    return this.getEnfermedades().join(', ');
  }

  get comidasActuales(): number {
    if (!this.xuxemon || this.estaBloqueado) return 0;
    return Math.max(0, this.xuxemon.comidas || 0);
  }

  get comidasObjetivo(): number {
    return this.xuxesNecesarias;
  }

  get xuxesRestantes(): number {
    if (this.comidasObjetivo <= 0) return 0;
    return Math.max(0, this.comidasObjetivo - this.comidasActuales);
  }

  get siguienteTamano(): string {
    if (this.estaBloqueado) return '';

    const tamano = this.normalizarTamano(this.xuxemon?.tamano);

    if (tamano === 'pequeno') return 'Mediano';
    if (tamano === 'mediano') return 'Grande';

    return '';
  }

  onImageError(): void {
    const ultimaRuta = this.getRutasImagen().length - 1;

    if (this.indiceImagenActual < ultimaRuta) {
      this.indiceImagenActual += 1;
    }
  }

  private getRutasImagen(): string[] {
    if (!this.xuxemon) {
      return [this.placeholderImage];
    }

    const tamano = this.normalizarTamano(this.xuxemon.tamano);
    const variantes = this.getVariantesImagen();
    const id = this.xuxemon.id;
    const rutas: Array<string | undefined> = [];

    if (tamano === 'grande') {
      rutas.push(
        variantes.grande,
        `/imagenes/assets/${id}-grande-ia.webp`
      );
    } else if (tamano === 'pequeno') {
      rutas.push(
        variantes.pequena,
        `/imagenes/assets/${id}-pequeno-ia.webp`
      );
    } else {
      rutas.push(
        variantes.mediana,
        `/imagenes/assets/${id}.webp`
      );
    }

    const imagenBase = this.normalizarRutaImagen(this.xuxemon.imagen);
    rutas.push(
      imagenBase,
      `/imagenes/assets/${id}.webp`,
      `/imagenes/assets/${id}-pequeno-ia.webp`,
      `/imagenes/assets/${id}-grande-ia.webp`,
      this.placeholderImage
    );

    return Array.from(new Set(rutas.filter((ruta): ruta is string => Boolean(ruta))));
  }

  private getVariantesImagen(): { pequena?: string; mediana?: string; grande?: string } {
    const datos = this.xuxemon as IXuxemon & Record<string, string | undefined>;

    return {
      pequena: this.normalizarRutaImagen(datos['imagen_pequena'] ?? datos['imagen_pequeña'] ?? datos['imagenPequena']),
      mediana: this.normalizarRutaImagen(datos['imagen_mediana'] ?? datos['imagenMediana']),
      grande: this.normalizarRutaImagen(datos['imagen_grande'] ?? datos['imagenGrande'])
    };
  }

  private normalizarRutaImagen(ruta?: string): string | undefined {
    if (!ruta) {
      return undefined;
    }

    const limpia = ruta.trim();

    if (!limpia) {
      return undefined;
    }

    const rutaWebp = limpia.replace(/\.png$/i, '.webp');

    if (rutaWebp.startsWith('http://') || rutaWebp.startsWith('https://') || rutaWebp.startsWith('/')) {
      return rutaWebp;
    }

    return `/${rutaWebp}`;
  }

  private normalizarTamano(tamano?: string): 'pequeno' | 'mediano' | 'grande' {
    const valor = (tamano || 'Mediano')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (['gran', 'grande', 'big', 'large'].includes(valor)) {
      return 'grande';
    }

    if (['mitja', 'mediano', 'mediana', 'medium'].includes(valor)) {
      return 'mediano';
    }

    return 'pequeno';
  }

  private getTamanoTexto(): string {
    const tamano = this.normalizarTamano(this.xuxemon?.tamano);

    if (tamano === 'grande') {
      return 'Grande';
    }

    if (tamano === 'mediano') {
      return 'Mediano';
    }

    return 'Pequeno';
  }

  get bloqueoTexto(): string {
    return 'Desbloquealo para ver sus stats y evolucion.';
  }

  private getEnfermedades(): string[] {
    if (!this.xuxemon) {
      return [];
    }

    const lista = Array.isArray(this.xuxemon.enfermedades)
      ? this.xuxemon.enfermedades
      : [];

    if (this.xuxemon.enfermedad && !lista.includes(this.xuxemon.enfermedad)) {
      return [...lista, this.xuxemon.enfermedad];
    }

    return lista;
  }

  private getEvolveBase(): number {
    const base = this.gameConfigService.snapshot.evolve_xuxes;
    return base > 0 ? base : 3;
  }
}
