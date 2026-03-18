import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {

  slots: (Objeto | null)[] = [];
  isAdmin: boolean = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };

  tiposXuxe = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];

  // Inventario de prueba (esto vendría de un servicio en el futuro)
  private inventarioBase: Objeto[] = [
    { nombre: 'Xuxe Caramelo', tipo: 'Xuxe', cantidad: 12, stackable: true, imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', tipo: 'Xuxe', cantidad: 3, stackable: true, imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', tipo: 'Xuxe', cantidad: 7, stackable: true, imagen: '/assets/images/menta.png' },
    { nombre: 'Vacuna A', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/nube.png' },
    { nombre: 'Vacuna B', tipo: 'Vacuna', cantidad: 1, stackable: false, imagen: '/assets/images/piruleta_sola.png' },
  ];

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit() {
    this.checkUserRole();

    // Suscribirse a los slots del servicio
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.inventoryService.organizarMochila(this.inventarioBase);
  }

  checkUserRole() {
    this.authService.me().subscribe({
      next: (user) => {
        this.isAdmin = user.role === 'admin';
        if (this.isAdmin) {
          this.loadPlayers();
        }
      }
    });
  }

  loadPlayers() {
    this.authService.getUsers().subscribe(users => {
      this.players = users.filter(u => u.role !== 'admin');
    });
  }

  addXuxesToPlayer() {
    if (!this.selectedPlayerId) return;

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    if (!player) return;

    // Obtener inventario actual del jugador o vacío
    let inventory = player.inventory || [];

    // Calcular slots usados mediante el servicio
    const totalSlotsUsed = this.inventoryService.calculateSlotsUsed(inventory);
    const availableSlots = 20 - totalSlotsUsed;

    if (availableSlots <= 0) {
      alert('La mochila del jugador está llena. No se pueden añadir más Xuxes.');
      return;
    }

    const selectedXuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeToAdd.nombre);

    // Crear el nuevo objeto
    const newItem: Objeto = {
      nombre: this.xuxeToAdd.nombre,
      tipo: 'Xuxe',
      cantidad: this.xuxeToAdd.cantidad,
      stackable: true,
      imagen: selectedXuxe?.imagen || ''
    };

    // Lógica de descarte si no caben
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
        this.loadPlayers(); // Recargar para tener el inventario actualizado
      },
      error: () => alert('Error al actualizar el inventario.')
    });
  }
}
