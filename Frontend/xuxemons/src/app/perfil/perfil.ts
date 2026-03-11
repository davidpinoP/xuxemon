import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  formularioPerfil = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email])
  });

  mensajeExito = '';
  mensajeError = '';
  cargando = true;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.formularioPerfil.patchValue({
          nombre: data.name,
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

  guardarPerfil(): void {
    if (this.formularioPerfil.valid) {
      const datos = {
        name: this.formularioPerfil.value.nombre,
        email: this.formularioPerfil.value.correo
      };
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

  volver(): void {
    this.router.navigate(['/home']);
  }
}
