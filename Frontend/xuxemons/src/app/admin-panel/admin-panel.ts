import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Xuxemon } from '../services/xuxemon';
import { AuthService } from '../services/auth.service';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';
import { GameConfigService } from '../services/game-config.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
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
    private seoService: SeoService,
    private gameConfigService: GameConfigService
  ) {
    this.fConfig = this.fb.group({
      pct_bajon_azucar: [0],
      pct_sobredosis_sucre: [0],
      pct_atracon: [0],
      evolve_xuxes: [0],
      reward_hour: [0],
      reward_xuxes_amount: [10]
    });
  }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Panel Admin',
      description: 'Administra la configuracion global y las acciones de gestion para jugadores.'
    });

    this.cargarUsuarios();
    this.xuxemonService.getConfigs().subscribe((data: any) => this.fConfig.patchValue(data));
  }

  cargarUsuarios(): void {
    this.authService.getUsers().subscribe({
      next: (data: any) => (this.users = data),
      error: (err: any) => console.error('Error al cargar usuarios', err)
    });
  }

  saveConf(): void {
    this.xuxemonService.saveConfigs(this.fConfig.value).subscribe({
      next: (response: any) => {
        this.gameConfigService.load().subscribe();
        this.mensajeRegalo = response?.message || 'Ajustes globales guardados correctamente.';
      },
      error: (err: any) => {
        alert(err?.error?.message || 'No se han podido guardar los ajustes globales.');
      }
    });
  }

  vacuna(id: number, nombre: string): void {
    this.xuxemonService.darVacuna(id, nombre).subscribe({
      next: () => alert('Vacuna enviada'),
      error: (err: any) => alert(err?.error?.message || 'Error al enviar vacuna')
    });
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

    this.xuxemonService.darXuxes(
      this.selectedPlayerId,
      this.xuxeToAdd.nombre,
      this.xuxeToAdd.cantidad
    ).subscribe({
      next: (response: any) => {
        this.xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };
        this.mensajeRegalo = response?.mensaje || 'Xuxes añadidas correctamente.';
        this.cargarUsuarios();
      },
      error: (err: any) => alert(err?.error?.error || err?.error?.message || 'No se han podido añadir las xuxes.')
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
