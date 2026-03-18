import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

export interface Objeto {
  nombre: string;
  tipo: 'Xuxe' | 'Vacuna';
  cantidad: number;
  stackable: boolean;
  imagen: string;
}

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {

  slots: (Objeto | null)[] = Array(20).fill(null);
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

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.checkUserRole();
    this.organizarMochila();
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

    // Simular el llenado de slots para ver si cabe
    const totalSlotsUsed = this.calculateSlotsUsed(inventory);
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

    // Añadir al inventario base del jugador
    // Nota: Aquí lo guardamos plano, la lógica de visualización (organizarMochila) se encarga de los slots.
    // Pero el requisito dice "si sobran se descartan", lo que significa que limitamos la cantidad antes de guardar.

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

  calculateSlotsUsed(inventory: Objeto[]): number {
    let slots = 0;
    for (const item of inventory) {
      if (item.stackable) {
        slots += Math.ceil(item.cantidad / 5);
      } else {
        slots += item.cantidad;
      }
    }
    return slots;
  }

  organizarMochila() {
    let currentSlot = 0;
    const maxSlots = 20;

    for (const item of this.inventarioBase) {
      if (currentSlot >= maxSlots) break;

      if (item.stackable) {
        let remaining = item.cantidad;
        while (remaining > 0 && currentSlot < maxSlots) {
          const stackSize = Math.min(remaining, 5);
          this.slots[currentSlot] = { ...item, cantidad: stackSize };
          remaining -= stackSize;
          currentSlot++;
        }
      } else {
        // No apilable: uno por slot
        for (let i = 0; i < item.cantidad && currentSlot < maxSlots; i++) {
          this.slots[currentSlot] = { ...item, cantidad: 1 };
          currentSlot++;
        }
      }
    }
  }
}
