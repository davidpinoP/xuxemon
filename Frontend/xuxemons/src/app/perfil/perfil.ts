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
    apellidos: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    password_confirmation: new FormControl('')
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

  volver(): void {
    this.router.navigate(['/home']);
  }
}
