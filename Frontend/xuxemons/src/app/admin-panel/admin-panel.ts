import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Xuxemon } from '../services/xuxemon';
import { AuthService } from '../services/auth.service';
import { Objeto } from '../services/inventory.service';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {
  xuxemons: any[] = [];
  users: any[] = [];
  xuxemonForm: FormGroup;
  isEditing = false;
  currentId: number | null = null;
  fConfig: FormGroup;

  selectedPlayerId: number | null = null;
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };
  tiposXuxe = [
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];
  regalandoXuxemonUserId: number | null = null;
  mensajeRegalo = '';

  constructor(
    private fb: FormBuilder,
    private xuxemonService: Xuxemon,
    private authService: AuthService,
    private seoService: SeoService
  ) {
    this.xuxemonForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      descripcion: [''],
      tamano: ['', Validators.required]
    });

    this.fConfig = this.fb.group({
      infection_pct: [0],
      evolve_xuxes: [0],
      reward_hour: [0]
    });
  }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Panel Admin',
      description: 'Administra Xuxemons, configuracion global y acciones de gestion para jugadores.'
    });

    this.cargarXuxemons();
    this.cargarUsuarios();
    this.xuxemonService.getConfigs().subscribe((data: any) => this.fConfig.patchValue(data));
  }

  cargarUsuarios(): void {
    this.authService.getUsers().subscribe({
      next: (data: any) => (this.users = data),
      error: (err: any) => console.error('Error al cargar usuarios', err)
    });
  }

  cargarXuxemons(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: any) => (this.xuxemons = data),
      error: (err: any) => console.error('Error al cargar Xuxemons', err)
    });
  }

  guardarXuxemon(): void {
    if (this.xuxemonForm.invalid) return;

    if (this.isEditing && this.currentId) {
      this.xuxemonService.updateXuxemon(this.currentId, this.xuxemonForm.value).subscribe({
        next: () => {
          alert('Xuxemon actualizado correctamente');
          this.resetForm();
          this.cargarXuxemons();
        },
        error: () => alert('Error al actualizar')
      });

      return;
    }

    this.xuxemonService.createXuxemon(this.xuxemonForm.value).subscribe({
      next: () => {
        alert('Nuevo Xuxemon creado');
        this.resetForm();
        this.cargarXuxemons();
      },
      error: () => alert('Error al crear')
    });
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
    if (!confirm('Estas seguro de que quieres borrar este Xuxemon?')) {
      return;
    }

    this.xuxemonService.deleteXuxemon(id).subscribe({
      next: () => {
        alert('Xuxemon eliminado');
        this.cargarXuxemons();
      },
      error: () => alert('Error al borrar')
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.xuxemonForm.reset();
  }

  saveConf(): void {
    this.xuxemonService.saveConfigs(this.fConfig.value).subscribe(() => alert('Guardado'));
  }

  vacuna(id: number, nombre: string): void {
    this.xuxemonService.darVacuna(id, nombre).subscribe(() => alert('Vacuna enviada'));
  }

  toggleUser(user: any): void {
    const accion = user.is_active
      ? this.authService.deactivateUser(user.id)
      : this.authService.restoreUser(user.id);

    accion.subscribe({
      next: (res: any) => {
        user.is_active = !user.is_active;
        this.mensajeRegalo = res.message;
      },
      error: (err: any) => alert(err?.error?.message || 'Error al cambiar estado del usuario')
    });
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
        alert('Item anadido correctamente.');
      },
      error: () => alert('No se ha podido anadir el item.')
    });
  }

  darXuxemonAleatorio(idJugador: string | number): void {
    if (!idJugador) {
      alert('Introduce un ID de jugador valido.');
      return;
    }

    this.regalandoXuxemonUserId = Number(idJugador);
    this.mensajeRegalo = '';

    this.xuxemonService.darXuxemonAleatorio(idJugador).subscribe({
      next: (response: any) => {
        const sufijo = response?.nuevo_desbloqueo ? 'nuevo desbloqueo' : 'ya lo tenia';
        this.mensajeRegalo = `Jugador ${idJugador}: ${response?.xuxemon || 'Xuxemon'} (${sufijo})`;
        this.regalandoXuxemonUserId = null;
      },
      error: (err: any) => {
        console.error('Error al dar Xuxemon:', err);
        this.regalandoXuxemonUserId = null;
        const backendMessage =
          err?.error?.message ||
          err?.error?.mensaje ||
          err?.error?.error ||
          `Error HTTP ${err?.status || 'desconocido'}`;
        alert(`Hubo un error al anadir el Xuxemon: ${backendMessage}`);
      }
    });
  }
}
