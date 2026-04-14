import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Xuxemon } from '../services/xuxemon';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {

  xuxemons: any[] = [];
  users: any[] = [];
  xuxemonForm: FormGroup;
  isEditing: boolean = false;
  currentId: number | null = null;
  // nuevas propiedades simples
  fConfig: FormGroup;

  selectedPlayerId: number | null = null;
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };
  tiposXuxe = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];

  constructor(
    private fb: FormBuilder,
    private xuxemonService: Xuxemon,
    private authService: AuthService,
    private inventoryService: InventoryService
  ) {
    this.xuxemonForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      descripcion: [''],
      tamano: ['', Validators.required]
    });
    // form de configuracion
    this.fConfig = this.fb.group({
      infection_pct: [0],
      evolve_xuxes: [0],
      reward_hour: [0]
    });
  }


  ngOnInit(): void {
    this.cargarXuxemons();
    this.cargarUsuarios();
    this.xuxemonService.getConfigs().subscribe((d: any) => this.fConfig.patchValue(d));
  }

  cargarUsuarios(): void {
    this.authService.getUsers().subscribe({
      next: (data: any) => this.users = data,
      error: (err: any) => console.error('Error al cargar usuarios', err)
    });
  }


  cargarXuxemons(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: any) => this.xuxemons = data,
      error: (err: any) => console.error('Error al cargar Xuxemons', err)
    });
  }

  guardarXuxemon(): void {
    if (this.xuxemonForm.invalid) return;
    if (this.isEditing && this.currentId) {
      this.xuxemonService.updateXuxemon(this.currentId, this.xuxemonForm.value).subscribe({
        next: () => {
          alert('¡Xuxemon actualizado correctamente!');
          this.resetForm();
          this.cargarXuxemons();
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.xuxemonService.createXuxemon(this.xuxemonForm.value).subscribe({
        next: () => {
          alert('¡Nuevo Xuxemon creado!');
          this.resetForm();
          this.cargarXuxemons();
        },
        error: () => alert('Error al crear')
      });
    }
  }

  editarXuxemon(xuxe: any): void {
    this.isEditing = true;
    this.currentId = xuxe.id;
    this.xuxemonForm.patchValue({
      nombre: xuxe.nombre,
      tipo: xuxe.tipo,
      descripcion: xuxe.descripcion
    });
  }

  borrarXuxemon(id: number): void {
    if (confirm(' ¿Estás totalmente seguro de que quieres borrar este Xuxemon?')) {
      this.xuxemonService.deleteXuxemon(id).subscribe({
        next: () => {
          alert('Xuxemon eliminado');
          this.cargarXuxemons();
        },
        error: () => alert('Error al borrar')
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.xuxemonForm.reset();
  }

  // guardar configs
  saveConf() {
    this.xuxemonService.saveConfigs(this.fConfig.value).subscribe(() => alert('guardado'));
  }

  // dar vacuna
  vacuna(id: number, n: string) {
    this.xuxemonService.darVacuna(id, n).subscribe(() => alert('vacuna enviada'));
  }

  addXuxesToPlayer(): void {
    if (!this.selectedPlayerId) {
      alert('Selecciona un jugador.');
      return;
    }

    if (this.xuxeToAdd.cantidad < 1) {
      alert('La cantidad debe ser mayor que 0.');
      return;
    }

    const player = this.users.find((user) => user.id === this.selectedPlayerId);

    if (!player) {
      alert('Jugador no encontrado.');
      return;
    }

    const inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
    const existingItem = inventory.find((item: any) => item.nombre === this.xuxeToAdd.nombre);

    if (existingItem) {
      existingItem.cantidad += this.xuxeToAdd.cantidad;
    } else {
      const nuevoItem: Objeto = {
        nombre: this.xuxeToAdd.nombre,
        tipo: 'Xuxe',
        cantidad: this.xuxeToAdd.cantidad,
        stackable: true,
        imagen: ''
      };

      inventory.push(nuevoItem);
    }

    this.authService.updateUserInventory(player.id, inventory).subscribe({
      next: () => {
        player.inventory = inventory;
        this.xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };
        alert('Item añadido correctamente.');
      },
      error: () => {
        alert('No se ha podido añadir el item.');
      }
    });
  }

  
  // Dar Xuxemon Aleatorio
  darXuxemonAleatorio(idJugador: string | number): void {
    if (!idJugador) {
      alert('Por favor, introduce un ID de jugador válido.');
      return;
    }

    // Llamamos al servicio para que hable con tu backend
    this.xuxemonService.darXuxemonAleatorio(idJugador).subscribe({
      next: (response: any) => {
        alert('🎲 ¡Xuxemon aleatorio añadido con éxito al jugador ' + idJugador + '!');
      },
      error: (err: any) => {
        console.error('Error al dar Xuxemon:', err);
        alert('Hubo un error al añadir el Xuxemon. Comprueba que el jugador existe y el servicio esté configurado.');
      }
    });
  }
}