import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';

@Component({
  selector: 'app-xuxemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xuxemon-card.html',
  styleUrl: './xuxemon-card.css',
  encapsulation: ViewEncapsulation.None
})
export class XuxemonCardComponent implements OnChanges {
  @Input() xuxemon!: IXuxemon;
  @Input() xuxesDisponibles = 0;
  @Output() evolucionar$ = new EventEmitter<{ xuxemonId: number; nuevoTamano: string; coste: number }>();

  evolucionando = false;
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

    if (this.xuxemon?.enfermedad) {
      return `Estado: Enfermo - ${this.xuxemon.enfermedad}`;
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

    if (tamano === 'pequeno') return base;
    if (tamano === 'mediano') return base + 2;

    return 0;
  }

  get puedeEvolucionar(): boolean {
    return !this.estaBloqueado && this.xuxesNecesarias > 0 && this.xuxesDisponibles >= this.xuxesNecesarias;
  }

  get siguienteTamano(): string {
    if (this.estaBloqueado) return '';

    const tamano = this.normalizarTamano(this.xuxemon?.tamano);

    if (tamano === 'pequeno') return 'Mediano';
    if (tamano === 'mediano') return 'Grande';

    return '';
  }

  evolucionar(): void {
    if (!this.puedeEvolucionar || this.evolucionando) return;

    this.evolucionando = true;

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
    const ultimaRuta = this.getRutasImagen().length - 1;

    if (this.indiceImagenActual < ultimaRuta) {
      this.indiceImagenActual += 1;
    }
  }

  private getRutasImagen(): string[] {
    if (!this.xuxemon) {
      return [this.placeholderImage];
    }

    const imagenBase = this.normalizarRutaImagen(this.xuxemon.imagen) || `/imagenes/assets/${this.xuxemon.id}.webp`;
    const tamano = this.normalizarTamano(this.xuxemon.tamano);
    const variantes = this.getVariantesImagen();
    const rutas: Array<string | undefined> = [];

    if (tamano === 'grande') {
      rutas.push(
        variantes.grande,
        this.crearRutaPorTamano(imagenBase, 'grande'),
        variantes.mediana,
        imagenBase
      );
    } else if (tamano === 'pequeno') {
      rutas.push(
        variantes.pequena,
        this.crearRutaPorTamano(imagenBase, 'pequeno'),
        variantes.mediana,
        imagenBase
      );
    } else {
      rutas.push(
        variantes.mediana,
        imagenBase,
        variantes.pequena,
        this.crearRutaPorTamano(imagenBase, 'pequeno'),
        variantes.grande,
        this.crearRutaPorTamano(imagenBase, 'grande')
      );
    }

    rutas.push(`/imagenes/assets/${this.xuxemon.id}.webp`, this.placeholderImage);

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

  private crearRutaPorTamano(imagenBase: string, tamano: 'pequeno' | 'grande'): string {
    const indicePunto = imagenBase.lastIndexOf('.');

    if (indicePunto === -1) {
      return `${imagenBase}-${tamano}-ia.webp`;
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
