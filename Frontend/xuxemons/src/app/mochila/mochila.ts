import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {
  slots: (Objeto | null)[] = [];
  inventarioBase: Objeto[] = [];

  // ── Variables del Modal de Alimentación ──
  mostrarModal = false;
  pasoModal = 1;
  misXuxemons: IXuxemon[] = [];
  xuxemonSeleccionado: IXuxemon | null = null;
  xuxeSeleccionada = '';
  cantidadAlimentar = 1;
  mensajeError = '';

  // ── Variables del Modal de Vacunación (Hospital) ──
  mostrarModalVacuna = false;
  xuxemonEnfermoSeleccionado: IXuxemon | null = null;
  vacunaSeleccionada = '';
  mensajeErrorVacuna = '';

  // ── Variables Admin ──
  isAdmin = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  tiposXuxe = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private xuxemonService: XuxemonService,
    private gameConfigService: GameConfigService,
    private seoService: SeoService
  ) { }

  ngOnInit() {
    this.seoService.update({
      title: 'Mochila',
      description: 'Gestiona tu inventario, alimenta a tus Xuxemons y usa vacunas desde la mochila.'
    });

    // Me suscribo al BehaviorSubject para tener siempre la mochila actualizada
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.cargarInventario();
    this.cargarMisXuxemons();
    this.checkUserRole();
  }

  abrirModal() {
    this.mostrarModal = true;
    this.pasoModal = 1;
    this.mensajeError = '';

    setTimeout(() => {
      const primerCampo = document.getElementById('select-xuxemon') as HTMLElement | null;
      if (primerCampo) {
        primerCampo.focus();
      }
    }, 0);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pasoModal = 1;
    this.xuxemonSeleccionado = null;
    this.xuxeSeleccionada = '';
    this.cantidadAlimentar = 1;
    this.mensajeError = '';
  }

  // 1️⃣ Esta función llama a Laravel (backend) para descargarse toda la mochila del jugador
  cargarInventario() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        const mochila = Array.isArray(user?.mochila) ? user.mochila : [];
        // Convertimos la mochila del backend al formato visual que usa el frontend.
        this.inventarioBase = this.convertirMochilaAObjetos(mochila);
        // Aqui se aplica el apilamiento y el limite de 20 huecos.
        this.inventoryService.organizarMochila(this.inventarioBase);
      },
      error: () => {
        this.inventarioBase = [];
        this.inventoryService.organizarMochila(this.inventarioBase);
      }
    });
  }

  cargarMisXuxemons() {
    this.xuxemonService.getMisXuxemons().subscribe({
      next: (xuxemons: IXuxemon[]) => {
        this.misXuxemons = xuxemons;
      },
      error: () => {
        this.misXuxemons = [];
      }
    });
  }

  getXuxesDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Xuxe' && item.cantidad > 0);
  }

  getMaxCantidad(): number {
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    return xuxe ? xuxe.cantidad : 0;
  }

  getImagenXuxe(): string {
    const xuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeSeleccionada);
    return xuxe?.imagen || '';
  }

  irAPreview() {
    this.mensajeError = '';

    if (!this.xuxemonSeleccionado) {
      this.mensajeError = 'Selecciona un Xuxemon';
      return;
    }
    if (!this.xuxeSeleccionada) {
      this.mensajeError = 'Selecciona una Xuxe';
      return;
    }
    if (this.cantidadAlimentar < 1) {
      this.mensajeError = 'La cantidad debe ser al menos 1';
      return;
    }
    if (this.cantidadAlimentar > this.getMaxCantidad()) {
      this.mensajeError = `Solo tienes ${this.getMaxCantidad()} unidades de esa Xuxe`;
      return;
    }

    this.pasoModal = 2;
  }

  volverASeleccion() {
    this.pasoModal = 1;
  }

  // 2️⃣ Comprueba si con los caramelos que le vas a dar ahora mismo, a tu Xuxemon le toca crecer (Evolucionar)
  vaAEvolucionar(): boolean {
    if (!this.xuxemonSeleccionado) {
      return false;
    }

    if (this.tieneAtracon(this.xuxemonSeleccionado)) {
      return false;
    }

    // La preview calcula en cliente si con esta cantidad le toca subir de tamano.
    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    const threshold = this.getStageRequirement(this.xuxemonSeleccionado);
    const tamanoActual = (this.xuxemonSeleccionado.tamano || 'Pequeño').toLowerCase();

    return (tamanoActual === 'pequeño' || tamanoActual === 'mediano') && nuevasComidas >= threshold;
  }

  getNuevoTamano(): string {
    if (!this.xuxemonSeleccionado) {
      return '';
    }

    if (this.tieneAtracon(this.xuxemonSeleccionado)) {
      return this.xuxemonSeleccionado.tamano || 'Pequeño';
    }

    if (this.vaAEvolucionar()) {
      const tamanoActual = (this.xuxemonSeleccionado.tamano || 'Pequeño').toLowerCase();
      if (tamanoActual === 'pequeño') {
        return 'Mediano';
      }
      if (tamanoActual === 'mediano') {
        return 'Grande';
      }
    }

    if ((this.xuxemonSeleccionado.tamano || '').toLowerCase() === 'pequeño') {
      return 'Mediano';
    }

    return this.xuxemonSeleccionado.tamano || 'Pequeño';
  }

  confirmarAlimentacion() {
    if (!this.xuxemonSeleccionado) {
      return;
    }

    this.xuxemonService.alimentarXuxemon(
      this.xuxemonSeleccionado.id,
      this.xuxeSeleccionada,
      this.cantidadAlimentar
    ).subscribe({
      next: (respuesta: any) => {
        const nombre = this.xuxemonSeleccionado?.nombre || 'Tu Xuxemon';
        const mensaje = respuesta?.evoluciono
          ? `${nombre} ha evolucionado a ${respuesta?.xuxemon?.tamano}.`
          : `${nombre} ha sido alimentado correctamente.`;
        const detalles: string[] = [];

        if (respuesta?.se_infecto) {
          const nuevas = Array.isArray(respuesta?.enfermedades_nuevas) ? respuesta.enfermedades_nuevas : [];
          detalles.push(
            nuevas.length > 0
              ? `Se ha puesto malito: ${nuevas.join(', ')}.`
              : 'Se ha puesto malito (enfermo).'
          );
        }

        this.cargarInventario();
        this.cargarMisXuxemons();
        this.cerrarModal();
        alert(detalles.length ? `${mensaje} ${detalles.join(' ')}` : mensaje);
      },
      error: (error: any) => {
        this.mensajeError = error?.error?.message || 'No se ha podido alimentar al Xuxemon.';
      }
    });
  }

  // ── Métodos del Hospital (Vacunación) ──
  abrirModalVacuna() {
    this.mostrarModalVacuna = true;
    this.mensajeErrorVacuna = '';
    this.xuxemonEnfermoSeleccionado = null;
    this.vacunaSeleccionada = '';
  }

  cerrarModalVacuna() {
    this.mostrarModalVacuna = false;
  }

  getXuxemonsEnfermos(): IXuxemon[] {
    return this.misXuxemons.filter(x => this.getEnfermedades(x).length > 0);
  }

  getVacunasDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Vacuna' && item.cantidad > 0);
  }

  confirmarCuracion() {
    if (!this.xuxemonEnfermoSeleccionado) {
      this.mensajeErrorVacuna = 'Selecciona un Xuxemon enfermo';
      return;
    }
    if (!this.vacunaSeleccionada) {
      this.mensajeErrorVacuna = 'Selecciona una vacuna';
      return;
    }

    // Reutilizamos la misma ruta porque backend distingue si lo enviado es xuxe o vacuna.
    this.xuxemonService.alimentarXuxemon(
      this.xuxemonEnfermoSeleccionado.id,
      this.vacunaSeleccionada,
      1
    ).subscribe({
      next: (resp: any) => {
        alert(resp.message || 'Xuxemon curado correctamente.');
        this.cargarInventario();
        this.cargarMisXuxemons();
        this.cerrarModalVacuna();
      },
      error: (err: any) => {
        this.mensajeErrorVacuna = err?.error?.message || 'Error al curar al Xuxemon.';
      }
    });
  }

  getEnfermedadTexto(xuxemon: IXuxemon | null): string {
    return this.getEnfermedades(xuxemon).join(', ');
  }

  tieneAtracon(xuxemon: IXuxemon | null): boolean {
    return this.getEnfermedades(xuxemon).includes('Atracón');
  }

  tieneBajonAzucar(xuxemon: IXuxemon | null): boolean {
    return this.getEnfermedades(xuxemon).includes('Bajón de azúcar');
  }

  getStageRequirement(xuxemon: IXuxemon | null): number {
    const base = this.gameConfigService.snapshot.evolve_xuxes;
    const safeBase = base > 0 ? base : 3;
    const tamanoActual = (xuxemon?.tamano || 'Pequeño').toLowerCase();
    const baseEtapa = tamanoActual === 'mediano' ? safeBase + 2 : safeBase;
    return baseEtapa + (this.tieneBajonAzucar(xuxemon) ? 2 : 0);
  }

  private getEnfermedades(xuxemon: IXuxemon | null): string[] {
    if (!xuxemon) {
      return [];
    }

    const lista = Array.isArray(xuxemon.enfermedades) ? [...xuxemon.enfermedades] : [];

    if (xuxemon.enfermedad && !lista.includes(xuxemon.enfermedad)) {
      lista.push(xuxemon.enfermedad);
    }

    return lista;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mostrarModal) {
      this.cerrarModal();
    }
    if (this.mostrarModalVacuna) {
      this.cerrarModalVacuna();
    }
  }

  trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const modal = document.querySelector('.modal-contenido') as HTMLElement | null;

    if (!modal) {
      return;
    }

    const focusables = modal.querySelectorAll(
      'button, select, input, [href], textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusables.length === 0) {
      return;
    }

    const primero = focusables[0] as HTMLElement;
    const ultimo = focusables[focusables.length - 1] as HTMLElement;

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  checkUserRole() {
    this.authService.me().subscribe({
      next: (user: any) => {
        this.isAdmin = user.role === 'admin';
        if (this.isAdmin) {
          // El bloque admin de mochila solo se activa si el usuario autenticado tiene ese rol.
          this.loadPlayers();
        }
      }
    });
  }

  loadPlayers() {
    this.authService.getUsers().subscribe({
      next: (users: any[]) => {
        this.players = users;
      },
      error: () => {
        this.players = [];
      }
    });
  }

  addXuxesToPlayer() {
    if (!this.selectedPlayerId) {
      alert('Selecciona un jugador.');
      return;
    }

    if (this.xuxeToAdd.cantidad < 1) {
      alert('La cantidad debe ser mayor que 0.');
      return;
    }

    this.xuxemonService.darXuxes(
      this.selectedPlayerId,
      this.xuxeToAdd.nombre,
      this.xuxeToAdd.cantidad
    ).subscribe({
      next: (response: any) => {
        alert(response?.mensaje || 'Xuxes añadidas correctamente.');
        this.loadPlayers();
      },
      error: (err: any) => alert(err?.error?.error || err?.error?.message || 'Error al actualizar el inventario.')
    });
  }


  private convertirMochilaAObjetos(mochila: any[]): Objeto[] {
    // Este paso traduce los nombres del backend a objetos que el grid visual sabe pintar.
    const objetos: Objeto[] = [];

    for (const item of mochila) {
      if (item?.tipo === 'xuxemon') {
        continue; // Ignoramos a los bichos vivos, esto es el inventario de la mochila
      }

      const nombreOriginal = item?.nombre || 'Item';
      const nombre = nombreOriginal === 'Xuxe' ? 'Xuxe Caramelo' : nombreOriginal;
      
      const vacunasValidas = ['Xocolatina', 'Xal de fruites', 'Inxulina'];
      const esVacuna = item?.tipo === 'vacuna' || vacunasValidas.includes(nombre) || nombre.toLowerCase().includes('vacuna');

      objetos.push({
        nombre,
        tipo: esVacuna ? 'Vacuna' : 'Xuxe',
        cantidad: Number(item?.cantidad || 1),
        stackable: !esVacuna,
        imagen: this.obtenerImagenItem(nombre),
      });
    }

    return objetos;
  }

  private obtenerImagenItem(nombre: string): string {
    const nombreNormalizado = nombre.toLowerCase();

    if (nombreNormalizado.includes('choco') || nombre === 'Xocolatina') {
      return '/assets/images/choco.png';
    }

    if (nombreNormalizado.includes('menta') || nombre === 'Xal de fruites') {
      return '/assets/images/menta.png';
    }

    if (nombreNormalizado.includes('vacuna') || nombre === 'Inxulina') {
      return '/assets/images/nube.png';
    }

    return '/assets/images/caramel.png';
  }
}
