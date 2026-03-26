import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  // ── Variables del Modal de Alimentación ──
  mostrarModal = false;       // ¿Se muestra el modal?
  pasoModal = 1;              // Paso 1 = selección, Paso 2 = preview
  misXuxemons: IXuxemon[] = []; // Lista de Xuxemons del usuario
  xuxemonSeleccionado: IXuxemon | null = null; // Xuxemon elegido
  xuxeSeleccionada: string = '';  // Nombre de la Xuxe elegida
  cantidadAlimentar: number = 1;  // Cantidad de Xuxes a dar
  mensajeError: string = '';      // Para mostrar errores

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
    private xuxemonService: XuxemonService
  ) { }

  ngOnInit() {
    // Suscribirse a los slots del servicio
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.inventoryService.organizarMochila(this.inventarioBase);

    // Cargar Xuxemons del usuario
    this.cargarMisXuxemons();
    
    // Verificar si es admin
    this.checkUserRole();
  }

  deleteXuxemon(id: number) {
    // Implementar si es necesario
  }

  cargarMisXuxemons() {
    this.xuxemonService.getXuxemons().subscribe({
      next: (xuxemons: IXuxemon[]) => {
        this.misXuxemons = xuxemons;
      },
      error: (err: any) => console.error('Error cargando Xuxemons', err)
    });
  }

  loadPlayers() {
     this.authService.getPlayers().subscribe({
       next: (data: any[]) => this.players = data,
       error: (err: any) => console.error('Error cargando jugadores', err)
     });
  }


  // Abrir el modal
  abrirModal() {
    this.mostrarModal = true;
    this.pasoModal = 1;
    this.mensajeError = '';
  }

  // Cierra el modal and resetea todo
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
    const xuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeSeleccionada);
    return xuxe?.imagen || '';
  }

  // Pasar al paso 2 (preview) con validación
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

    this.pasoModal = 2; // Ir al preview
  }

  // Volver al paso 1 desde el preview
  volverASeleccion() {
    this.pasoModal = 1;
  }

  // Lógica para el preview: ¿evolucionará?
  vaAEvolucionar(): boolean {
    if (!this.xuxemonSeleccionado) return false;
    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    const tamanoActual = this.xuxemonSeleccionado.tamano?.toLowerCase();

    if (tamanoActual === 'pequeño' && nuevasComidas >= 3) return true;
    if (tamanoActual === 'mediano' && nuevasComidas >= 5) return true;
    
    return false;
  }

  getNuevoTamano(): string {
    if (!this.xuxemonSeleccionado) return '';
    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    
    if (nuevasComidas >= 5) return 'Grande';
    if (nuevasComidas >= 3) return 'Mediano';
    return this.xuxemonSeleccionado.tamano || 'Pequeño';
  }

  // Confirmar la alimentación: descontar del inventario
  confirmarAlimentacion() {
    if (!this.xuxemonSeleccionado) return;

    this.xuxemonService.feedXuxemon(this.xuxemonSeleccionado.id, this.xuxeSeleccionada, this.cantidadAlimentar)
      .subscribe({
        next: (res: any) => {
          // Buscar la Xuxe en el inventario y restar la cantidad
          const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
          if (xuxe) {
            xuxe.cantidad -= this.cantidadAlimentar;
          }

          // Reorganizar la mochila para reflejar el cambio
          this.inventoryService.organizarMochila(this.inventarioBase);

          alert(`¡${this.xuxemonSeleccionado?.nombre} ha sido alimentado con ${this.cantidadAlimentar}x ${this.xuxeSeleccionada}!`);
          this.cerrarModal();
        },
        error: (err: any) => {
          this.mensajeError = err.error?.message || 'Error al alimentar al Xuxemon';
        }
      });
  }

  // ── Accesibilidad ──

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: any) {
    if (this.mostrarModal) {
      this.cerrarModal();
    }
  }

  trapFocus(event: any) {
    const modal = document.querySelector('.modal-contenido') as HTMLElement;
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
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
}
