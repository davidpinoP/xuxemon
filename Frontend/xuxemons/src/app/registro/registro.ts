import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  FormularioRegistro = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmar_password: new FormControl('', [Validators.required]),
  });

  error_msg: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  Submit() {
    if (this.FormularioRegistro.valid) {
      if (this.FormularioRegistro.value.password !== this.FormularioRegistro.value.confirmar_password) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const userData = {
        name: this.FormularioRegistro.value.nombre,
        surname: this.FormularioRegistro.value.nombre,
        email: this.FormularioRegistro.value.correo,
        password: this.FormularioRegistro.value.password
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          this.authService.saveToken(response.access_token);
          this.authService.savePlayerId(response.player_id);
          alert('¡Registro completado! Tu ID de jugador es: ' + response.player_id);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro', err);
          this.error_msg = 'Error al registrar el usuario. El correo o el nombre pueden estar ya en uso.';
        }
      });
    }
  }
}
