import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { FormsModule } from '@angular/forms'; // 👈 Añadido para que funcione el HTML de Admin
import { RouterLink } from '@angular/router'; // 👈 Añadido para solucionar el error de importación

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // 👈 Añadidos aquí
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {
  slots: (Objeto | null)[] = [];

  // Inventario de prueba (esto vendría de un servicio en el futuro)
  inventarioBase: Objeto[] = [
    { nombre: 'Xuxe Caramelo', tipo: 'Xuxe', cantidad: 12, stackable: true, imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', tipo: 'Xuxe', cantidad: 3, stackable: true, imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', tipo: 'Xuxe', cantidad: 7, stackable: true, imagen: '/assets/images/menta.png' },
    { nombre: 'Vacuna A', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/nube.png' },
    { nombre: 'Vacuna B', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/piruleta_sola.png' },
  ];

  // 👇 VARIABLES RESTAURADAS TRAS EL MERGE 👇
  isAdmin: boolean = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  xuxeToAdd = { nombre: '', cantidad: 1 };
  tiposXuxe: any[] = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' },
  ];
  // 👆 FIN VARIABLES RESTAURADAS 👆

  // ── Variables del Modal de Alimentación ──
  mostrarModal = false;       // ¿Se muestra el modal?
  pasoModal = 1;              // Paso 1 = selección, Paso 2 = preview
  misXuxemons: IXuxemon[] = []; // Lista de Xuxemons del usuario
  xuxemonSeleccionado: IXuxemon | null = null; // Xuxemon elegido
  xuxeSeleccionada: string = '';  // Nombre de la Xuxe elegida
  cantidadAlimentar: number = 1;  // Cantidad de Xuxes a dar
  mensajeError: string = '';      // Para mostrar errores

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private xuxemonService: XuxemonService
  ) { }

  ngOnInit() {
    // Suscribirse a los slots del servicio
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.inventoryService.organizarMochila(this.inventarioBase);
    this.checkUserRole(); // 👈 Comprobamos si es admin al cargar
  }

// Abre el modal y carga los Xuxemons del usuario
  abrirModal() {
    this.mostrarModal = true;
    this.pasoModal = 1;
    
    // Cargamos los Xuxemons del usuario para que pueda elegir a quién darle la chuche
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: IXuxemon[]) => this.misXuxemons = data,
      error: (err) => console.error('Error al cargar mis xuxemons en el modal', err)
    });
  }

  // Cierra el modal y resetea todo
  cerrarModal() {
    this.mostrarModal = false;
    this.pasoModal = 1;
    this.xuxemonSeleccionado = null;
    this.xuxeSeleccionada = '';
    this.cantidadAlimentar = 1;
    this.mensajeError = '';
  }

  // Obtener las Xuxes disponibles del inventario (solo tipo 'Xuxe')
  getXuxesDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Xuxe' && item.cantidad > 0);
  }

  // Obtener la cantidad máxima de la Xuxe seleccionada
  getMaxCantidad(): number {
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    return xuxe ? xuxe.cantidad : 0;
  }

  // Obtener la imagen de la Xuxe seleccionada
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

    //  NUEVA REGLA: EL HOSPITAL (Kenneth) 
    if (this.xuxemonSeleccionado.enfermedad) {
      this.mensajeError = `¡Oh no! ${this.xuxemonSeleccionado.nombre} tiene ${this.xuxemonSeleccionado.enfermedad}. ¡Cúralo primero con una vacuna!`;
      return;
    }
    // FIN DE LA NUEVA REGLA 

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

    this.pasoModal = 2; // Ir al preview
  }

  // Volver al paso 1 desde el preview
  volverASeleccion() {
    this.pasoModal = 1;
  }

  // Confirmar la alimentación: descontar del inventario
  confirmarAlimentacion() {
    // Buscar la Xuxe en el inventario y restar la cantidad
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    if (xuxe) {
      xuxe.cantidad -= this.cantidadAlimentar;
    }

    // Reorganizar la mochila para reflejar el cambio
    this.inventoryService.organizarMochila(this.inventarioBase);

    alert(`¡${this.xuxemonSeleccionado?.nombre} ha sido alimentado con ${this.cantidadAlimentar}x ${this.xuxeSeleccionada}!`);
    this.cerrarModal();
  }

  // ── Métodos existentes (Admin) ──

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

  // 👇 MÉTODO RESTAURADO TRAS EL MERGE 👇
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
      alert('La mochila del jugador está llena. No se pueden añadir más Xuxes.');
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
        error: () => alert('Error al actualizar el inventario.')
      });
    }
  }
}