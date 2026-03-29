import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  // ── Variables Admin ──
  isAdmin = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  tiposXuxe = [
    { nombre: 'Xuxe', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private xuxemonService: XuxemonService,
    private gameConfigService: GameConfigService
  ) { }

  ngOnInit() {
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

  cargarInventario() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        const mochila = Array.isArray(user?.mochila) ? user.mochila : [];
        this.inventarioBase = this.convertirMochilaAObjetos(mochila);
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

  vaAEvolucionar(): boolean {
    if (!this.xuxemonSeleccionado) {
      return false;
    }

    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    const tamanoActual = (this.xuxemonSeleccionado.tamano || 'Pequeño').toLowerCase();
    const thresholds = this.getEvolveThresholds();

    if (tamanoActual === 'pequeño' && nuevasComidas >= thresholds.toMediano) {
      return true;
    }

    if (tamanoActual === 'mediano' && nuevasComidas >= thresholds.toGrande) {
      return true;
    }

    return false;
  }

  getNuevoTamano(): string {
    if (!this.xuxemonSeleccionado) {
      return '';
    }

    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    const thresholds = this.getEvolveThresholds();

    if (nuevasComidas >= thresholds.toGrande) {
      return 'Grande';
    }

    if (nuevasComidas >= thresholds.toMediano) {
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
          detalles.push('Se ha puesto malito.');
        }

        if (respuesta?.curado) {
          detalles.push('Se ha curado con una vacuna.');
        }

        if (respuesta?.xuxemon?.enfermedad && !respuesta?.curado) {
          detalles.push('Necesita una vacuna para recuperarse.');
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

  private getEvolveThresholds(): { toMediano: number; toGrande: number } {
    const base = this.gameConfigService.snapshot.evolve_xuxes;
    const safeBase = base > 0 ? base : 3;

    return {
      toMediano: safeBase,
      toGrande: safeBase + 2
    };
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mostrarModal) {
      this.cerrarModal();
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
    if (!this.selectedPlayerId) return;

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    if (!player) return;

    let inventory = player.inventory || [];

    const totalSlotsUsed = this.inventoryService.calculateSlotsUsed(inventory);
    const availableSlots = 20 - totalSlotsUsed;

    if (availableSlots <= 0) {
      alert('La mochila del jugador está llena. No se pueden añadir más Xuxes.');
      return;
    }

    const selectedXuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeToAdd.nombre);

    const newItem: Objeto = {
      nombre: this.xuxeToAdd.nombre,
      tipo: 'Xuxe',
      cantidad: this.xuxeToAdd.cantidad,
      stackable: true,
      imagen: selectedXuxe?.imagen || ''
    };

    const slotsNeeded = Math.ceil(newItem.cantidad / 5);
    if (slotsNeeded > availableSlots) {
      const allowedAmount = availableSlots * 5;
      alert(`Solo caben ${allowedAmount} Xuxes. El resto se descartará.`);
      newItem.cantidad = allowedAmount;
    }

    inventory.push(newItem);

    this.authService.updateUserInventory(player.id, inventory).subscribe({
      next: () => {
        alert('Xuxes añadidas correctamente.');
        this.loadPlayers();
      },
      error: () => alert('Error al actualizar el inventario.')
    });
  }

  private convertirMochilaAObjetos(mochila: any[]): Objeto[] {
    const objetos: Objeto[] = [];

    for (const item of mochila) {
      if (item?.tipo === 'xuxemon') {
        continue;
      }

      const nombre = item?.nombre || 'Item';
      const esVacuna = nombre.toLowerCase().includes('vacuna');

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

    if (nombreNormalizado.includes('choco')) {
      return '/assets/images/choco.png';
    }

    if (nombreNormalizado.includes('menta')) {
      return '/assets/images/menta.png';
    }

    if (nombreNormalizado.includes('vacuna')) {
      return '/assets/images/nube.png';
    }

    return '/assets/images/caramel.png';
  }
}
