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
// Definición principal del componente de la carta, que recibe un Xuxemon de un componente padre (ej. Xuxedex)
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

  // Getter que devuelve un emoji representativo según el tipo de Xuxemon (agua, tierra, aire)
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

  // Devuelve el nombre del tipo formateado con la primera letra en mayúscula
  get tipoNombre(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'Desconocido';
    const tipo = this.xuxemon.tipo;
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  // Genera el nombre de la clase CSS que pintará la cabecera del color correspondiente al tipo
  get tipoClase(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'tipo-desconocido';
    return 'tipo-' + this.xuxemon.tipo.toLowerCase();
  }

  // Verifica si el usuario no posee este Xuxemon (para mostrarlo ensombrecido)
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

  // Devuelve un texto descriptivo del estado actual para mostrar en la interfaz
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

  // Obtiene la ruta de la imagen actual. Si falla al cargar, intentará con la siguiente en la lista de rutas generadas.
  get imagenMostrada(): string {
    const rutas = this.getRutasImagen();
    return rutas[this.indiceImagenActual] || this.placeholderImage;
  }

  // Genera estadísticas fijas pero únicas para cada Xuxemon usando su ID como "semilla" matemática.
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

  // Calcula cuántos caramelos (xuxes) hacen falta para evolucionar, aplicando penalizaciones si está enfermo
  get xuxesNecesarias(): number {
    if (!this.xuxemon || this.estaBloqueado) return 0;

    const tamano = this.normalizarTamano(this.xuxemon.tamano);
    const base = this.getEvolveBase();
    const penalizacion = this.tieneBajonAzucar ? 2 : 0;

    if (tamano === 'pequeno') return base + penalizacion;
    if (tamano === 'mediano') return base + 2 + penalizacion;

    return 0;
  }

  // Comprueba específicamente si tiene la penalización de Bajón de Azúcar
  get tieneBajonAzucar(): boolean {
    return this.getEnfermedades().includes('Bajón de azúcar');
  }

  // Une todas las enfermedades en un solo string separado por comas
  get enfermedadesTexto(): string {
    return this.getEnfermedades().join(', ');
  }

  // Devuelve cuántas chuches se le han dado ya al Xuxemon
  get comidasActuales(): number {
    if (!this.xuxemon || this.estaBloqueado) return 0;
    return Math.max(0, this.xuxemon.comidas || 0);
  }

  // Devuelve la meta de chuches para poder evolucionar
  get comidasObjetivo(): number {
    return this.xuxesNecesarias;
  }

  // Calcula cuántas chuches exactas le faltan para la evolución
  get xuxesRestantes(): number {
    if (this.comidasObjetivo <= 0) return 0;
    return Math.max(0, this.comidasObjetivo - this.comidasActuales);
  }

  // Determina cuál será la siguiente etapa evolutiva en base al tamaño actual
  get siguienteTamano(): string {
    if (this.estaBloqueado) return '';

    const tamano = this.normalizarTamano(this.xuxemon?.tamano);

    if (tamano === 'pequeno') return 'Mediano';
    if (tamano === 'mediano') return 'Grande';

    return '';
  }

  // Si la imagen falla (ej. error 404), este método salta automáticamente a la siguiente ruta de fallback (WebP alternativo o placeholder)
  onImageError(): void {
    const ultimaRuta = this.getRutasImagen().length - 1;

    if (this.indiceImagenActual < ultimaRuta) {
      this.indiceImagenActual += 1;
    }
  }

  // Lógica principal de búsqueda de imágenes: crea un array de rutas ordenadas por prioridad
  // Intenta cargar primero imágenes específicas del tamaño actual, si no, genéricas, y por último el placeholder.
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

  // Limpia y normaliza cualquier ruta de imagen, forzando la extensión .webp para optimizar peso
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
