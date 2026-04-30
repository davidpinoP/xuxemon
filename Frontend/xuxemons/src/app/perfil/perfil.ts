import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { AuthService } from '../services/auth.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  perfilUsuario = {
    name: '',
    surname: '',
    email: '',
    playerId: '',
    role: 'Entrenador'
  };

  formularioPerfil = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    sobreMi: new FormControl(''),
    password: new FormControl(''),
    password_confirmation: new FormControl('')
  });

  mensajeExito = '';
  mensajeError = '';
  cargando = true;
  amigos: any[] = [];
  misXuxemons: IXuxemon[] = [];
  duoFavorito: IXuxemon[] = [];
  xuxemonFavorito: IXuxemon | null = null;
  batallasGanadas = 200;
  avatarXuxemon: IXuxemon | null = null;
  mostrarSelectorAvatar = false;

  mostrarModal = false;
  amigoParaEliminar: any = null;
  amigoEnEliminacionId: number | null = null;
  private userId: string = '';

  constructor(
    private authService: AuthService,
    private xuxemonService: XuxemonService,
    private router: Router,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Perfil',
      description: 'Consulta y edita tu perfil de entrenador, tus amigos y tus Xuxemons favoritos.'
    });

    this.cargarPerfil();
    this.cargarAmigos();
  }

  cargarPerfil(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.perfilUsuario = {
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || '',
          playerId: data.player_id || localStorage.getItem('player_id') || '#Jugador0000',
          role: 'Entrenador'
        };

        this.userId = String(data.id);

        const sobreMiGuardado = localStorage.getItem('sobreMi_' + this.userId) || '';
        const avatarId = localStorage.getItem('avatarXuxemonId_' + this.userId);

        this.formularioPerfil.patchValue({
          nombre: data.name,
          apellidos: data.surname,
          correo: data.email,
          sobreMi: sobreMiGuardado
        });
        this.cargando = false;

        // Restaurar avatar guardado tras cargar xuxemons
        if (avatarId) {
          this._avatarIdPendiente = parseInt(avatarId, 10);
        }

        // Ahora que tenemos el userId y el posible avatar pendiente, cargamos los xuxemons
        this.cargarXuxemons();
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el perfil.';
        this.cargando = false;
      }
    });
  }

  private _avatarIdPendiente: number | null = null;

  cargarXuxemons(): void {
    this.xuxemonService.getMisXuxemons().subscribe({
      next: (data: IXuxemon[]) => {
        this.misXuxemons = data;

        if (data.length > 0) {
          this.duoFavorito = data.slice(0, 2);
          this.xuxemonFavorito = data[0];
        } else {
          this.aplicarFavoritosDemo();
        }

        // Restaurar avatar pendiente
        if (this._avatarIdPendiente !== null) {
          const encontrado = data.find(x => x.id === this._avatarIdPendiente);
          if (encontrado) this.avatarXuxemon = encontrado;
          this._avatarIdPendiente = null;
        }
      },
      error: () => {
        this.aplicarFavoritosDemo();
      }
    });
  }

  get xuxemonsDesbloqueados(): IXuxemon[] {
    return this.misXuxemons.filter(x => x.desbloqueado !== false && x.bloqueado !== true);
  }

  seleccionarAvatar(xuxemon: IXuxemon): void {
    this.avatarXuxemon = xuxemon;
    this.mostrarSelectorAvatar = false;
    localStorage.setItem('avatarXuxemonId_' + this.userId, String(xuxemon.id));
  }

  getXuxemonImageUrl(xuxemon: IXuxemon): string {
    return this.normalizarImagen(xuxemon.imagen) || `/imagenes/assets/${xuxemon.id}.webp`;
  }

  cargarAmigos(): void {
    this.authService.getAmigos().subscribe({
      next: (data: any[]) => {
        this.amigos = data;
      },
      error: () => {
        console.error('Error al cargar amigos');
      }
    });
  }

  guardarPerfil(): void {
    if (this.formularioPerfil.valid) {
      const datos: any = {
        name: this.formularioPerfil.value.nombre,
        surname: this.formularioPerfil.value.apellidos,
        email: this.formularioPerfil.value.correo
      };

      const pwd = this.formularioPerfil.value.password;
      if (pwd) {
        datos.password = pwd;
        datos.password_confirmation = this.formularioPerfil.value.password_confirmation;
      }

      // Guardar "Sobre Mi" localmente
      const sobreMi = this.formularioPerfil.value.sobreMi || '';
      localStorage.setItem('sobreMi_' + this.userId, sobreMi);

      this.authService.updateProfile(datos).subscribe({
        next: () => {
          this.perfilUsuario.name = datos.name;
          this.perfilUsuario.surname = datos.surname;
          this.perfilUsuario.email = datos.email;
          this.mensajeExito = 'Perfil actualizado correctamente.';
          this.mensajeError = '';
        },
        error: () => {
          this.mensajeError = 'Error al actualizar el perfil.';
          this.mensajeExito = '';
        }
      });
    }
  }

  desactivarCuenta(): void {
    if (confirm('¿Estás seguro de que quieres desactivar tu cuenta?')) {
      this.authService.deactivateAccount().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.mensajeError = 'Error al desactivar la cuenta.';
        }
      });
    }
  }

  abrirModalEliminar(amigo: any): void {
    this.amigoParaEliminar = amigo;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.amigoParaEliminar = null;
  }

  confirmarEliminarAmigo(): void {
    if (this.amigoParaEliminar) {
      const idAEliminar = this.amigoParaEliminar.id;
      this.authService.eliminarAmigo(idAEliminar).subscribe({
        next: () => {
          this.amigoEnEliminacionId = idAEliminar;
          this.cerrarModal();

          // Esperar a que la animación termine antes de refrescar la lista
          setTimeout(() => {
            this.cargarAmigos();
            this.amigoEnEliminacionId = null;
          }, 400); // 400ms coincide con la duración de la animación CSS
        },
        error: () => {
          console.error('Error al eliminar amigo');
          this.cerrarModal();
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  get nombreCompleto(): string {
    return `${this.perfilUsuario.name} ${this.perfilUsuario.surname}`.trim();
  }

  get sobreMiTexto(): string {
    return this.formularioPerfil.value.sobreMi || this.descripcionPerfil;
  }

  get descripcionPerfil(): string {
    const nombre = this.perfilUsuario.name || 'entrenador';
    return `Hola me llamo ${nombre.toLowerCase()}.`;
  }

  get playerIdVisible(): string {
    const playerId = this.perfilUsuario.playerId || localStorage.getItem('player_id') || 'Jugador0000';
    return playerId.startsWith('#') ? playerId : `#${playerId}`;
  }

  getXuxemonImage(xuxemon: IXuxemon): string {
    return this.normalizarImagen(xuxemon.imagen) || `/imagenes/assets/${xuxemon.id}.webp`;
  }

  private crearXuxemonDemo(id: number, nombre: string): IXuxemon {
    return {
      id,
      nombre,
      tipo: 'agua',
      tamano: 'pequeno',
      imagen: `/imagenes/assets/${id}.webp`
    };
  }

  private aplicarFavoritosDemo(): void {
    this.duoFavorito = [
      this.crearXuxemonDemo(4, 'Aquarion'),
      this.crearXuxemonDemo(2, 'Terrock')
    ];
    this.xuxemonFavorito = this.crearXuxemonDemo(3, 'Ventus');
  }

  private normalizarImagen(ruta?: string): string | undefined {
    if (!ruta) return undefined;
    return ruta.trim().replace(/\.png$/i, '.webp');
  }
}
