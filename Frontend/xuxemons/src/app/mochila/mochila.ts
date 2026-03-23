import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {

  slots: (Objeto | null)[] = [];


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
    private inventoryService: InventoryService,
    private router: Router
  ) { }

  ngOnInit() {

    // Suscribirse a los slots del servicio
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.inventoryService.organizarMochila(this.inventarioBase);
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }


}
