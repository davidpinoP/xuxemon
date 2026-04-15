import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  formularioPerfil = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    password_confirmation: new FormControl('')
  });

  mensajeExito = '';
  mensajeError = '';
  cargando = true;
  amigos: any[] = [];
  
  // Estado del modal y animaciones
  mostrarModal = false;
  amigoParaEliminar: any = null;
  amigoEnEliminacionId: number | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarAmigos();
  }

  cargarPerfil(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.formularioPerfil.patchValue({
          nombre: data.name,
          apellidos: data.surname,
          correo: data.email
        });
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el perfil.';
        this.cargando = false;
      }
    });
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
      
      this.authService.updateProfile(datos).subscribe({
        next: () => {
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
}
