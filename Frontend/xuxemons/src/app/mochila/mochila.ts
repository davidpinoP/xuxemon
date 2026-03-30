import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {
  slots: (Objeto | null)[] = [];

  // Inventario de prueba
  inventarioBase: Objeto[] = [
    { nombre: 'Xuxe Caramelo', tipo: 'Xuxe', cantidad: 12, stackable: true, imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', tipo: 'Xuxe', cantidad: 3, stackable: true, imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', tipo: 'Xuxe', cantidad: 7, stackable: true, imagen: '/assets/images/menta.png' },
    { nombre: 'Vacuna A', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/nube.png' },
    { nombre: 'Vacuna B', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/piruleta_sola.png' },
  ];

  // ── Variables de Admin ──
  isAdmin: boolean = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  xuxeToAdd = { nombre: '', cantidad: 1 };
  tiposXuxe: any[] = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' },
  ];

  // ── Variables del Modal de Alimentación ──
  mostrarModal = false;
  pasoModal = 1;
  misXuxemons: IXuxemon[] = [];
  xuxemonSeleccionado: IXuxemon | null = null;
  xuxeSeleccionada: string = '';
  cantidadAlimentar: number = 1;
  mensajeError: string = '';

  // ═══ VARIABLES Y FUNCIONES DEL HOSPITAL (VACUNAS) ═══
  mostrarModalVacuna = false;
  xuxemonEnfermoSeleccionado: IXuxemon | null = null;
  vacunaSeleccionada: string = '';
  mensajeErrorVacuna: string = '';

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private xuxemonService: XuxemonService
  ) { }

  ngOnInit() {
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.inventoryService.organizarMochila(this.inventarioBase);
    this.checkUserRole();
  }

  // ── Funciones del Hospital ──

  abrirModalVacuna() {
    this.mostrarModalVacuna = true;
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: IXuxemon[]) => this.misXuxemons = data,
      error: (err) => console.error('Error al cargar pacientes', err)
    });
  }

  cerrarModalVacuna() {
    this.mostrarModalVacuna = false;
    this.xuxemonEnfermoSeleccionado = null;
    this.vacunaSeleccionada = '';
    this.mensajeErrorVacuna = '';
  }

  getVacunasDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Vacuna' && item.cantidad > 0);
  }

  getXuxemonsEnfermos(): IXuxemon[] {
    return this.misXuxemons.filter(x => x.enfermedad);
  }

  confirmarCuracion() {
    this.mensajeErrorVacuna = '';

    if (!this.xuxemonEnfermoSeleccionado) {
      this.mensajeErrorVacuna = 'Selecciona un paciente.';
      return;
    }
    if (!this.vacunaSeleccionada) {
      this.mensajeErrorVacuna = 'Selecciona una vacuna del inventario.';
      return;
    }

    // Restar del inventario
    const vacuna = this.inventarioBase.find(item => item.nombre === this.vacunaSeleccionada);
    if (vacuna) {
      vacuna.cantidad -= 1;
    }
    this.inventoryService.organizarMochila(this.inventarioBase);

    // Curar
    const nombreCurado = this.xuxemonEnfermoSeleccionado.nombre;
    this.xuxemonEnfermoSeleccionado.enfermedad = undefined;

    alert(`¡Bien hecho! ${nombreCurado} ha sido curado exitosamente con ${this.vacunaSeleccionada}. ¡Ya puede volver a comer chuches!`);
    
    // (Llamada al backend)
    // this.xuxemonService.curarXuxemon(this.xuxemonEnfermoSeleccionado.id, this.vacunaSeleccionada).subscribe(...);

    this.cerrarModalVacuna();
  }

  // ── Funciones de Alimentación ──

  abrirModal() {
    this.mostrarModal = true;
    this.pasoModal = 1;
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: IXuxemon[]) => this.misXuxemons = data,
      error: (err) => console.error('Error al cargar mis xuxemons en el modal', err)
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pasoModal = 1;
    this.xuxemonSeleccionado = null;
    this.xuxeSeleccionada = '';
    this.cantidadAlimentar = 1;
    this.mensajeError = '';
  }

  getXuxesDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Xuxe' && item.cantidad > 0);
  }

  getMaxCantidad(): number {
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    return xuxe ? xuxe.cantidad : 0;
  }

  getImagenXuxe(): string {
    const xuxe = this.tiposXuxe.find((x: any) => x.nombre === this.xuxeSeleccionada);
    return xuxe?.imagen || '';
  }

  irAPreview() {
    this.mensajeError = '';

    if (!this.xuxemonSeleccionado) {
      this.mensajeError = 'Selecciona un Xuxemon';
      return;
    }

    if (this.xuxemonSeleccionado.enfermedad) {
      this.mensajeError = `¡Oh no! ${this.xuxemonSeleccionado.nombre} tiene ${this.xuxemonSeleccionado.enfermedad}. ¡Cúralo primero con una vacuna!`;
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

  confirmarAlimentacion() {
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    if (xuxe) {
      xuxe.cantidad -= this.cantidadAlimentar;
    }

    this.inventoryService.organizarMochila(this.inventarioBase);

    alert(`¡${this.xuxemonSeleccionado?.nombre} ha sido alimentado con ${this.cantidadAlimentar}x ${this.xuxeSeleccionada}!`);
    this.cerrarModal();
  }

  // ── Funciones de Admin ──

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
    if (typeof (this.authService as any).getUsers === 'function') {
      (this.authService as any).getUsers().subscribe({
        next: (users: any[]) => this.players = users,
        error: () => console.log('Error cargando usuarios')
      });
    }
  }

  addXuxesToPlayer() {
    if (!this.selectedPlayerId) return;

    const player = this.players.find((p: any) => p.id === this.selectedPlayerId);
    if (!player) return;

    let inventory = player.inventory || [];
    const totalSlotsUsed = this.inventoryService.calculateSlotsUsed(inventory);
    const availableSlots = 20 - totalSlotsUsed;

    if (availableSlots <= 0) {
      alert('La mochila del jugador está llena.');
      return;
    }

    const selectedXuxe = this.tiposXuxe.find((x: any) => x.nombre === this.xuxeToAdd.nombre);

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

    if (typeof (this.authService as any).updateUserInventory === 'function') {
      (this.authService as any).updateUserInventory(player.id, inventory).subscribe({
        next: () => {
          alert('Xuxes añadidas correctamente.');
          this.loadPlayers();
        },
        error: () => alert('Error al actualizar.')
      });
    }
  }
}