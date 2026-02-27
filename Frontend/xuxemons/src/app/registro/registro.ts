import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  FormularioRegistro = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    contraseña: new FormControl('', [Validators.required]),
    confirmar_contraseña: new FormControl('', [Validators.required]),
  });

  constructor(private authService: AuthService, private router: Router) { }

  Submit() {
    if (this.FormularioRegistro.valid) {
      if (this.FormularioRegistro.value.contraseña !== this.FormularioRegistro.value.confirmar_contraseña) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const userData = {
        name: this.FormularioRegistro.value.nombre,
        surname: this.FormularioRegistro.value.apellido,
        email: this.FormularioRegistro.value.correo,
        password: this.FormularioRegistro.value.contraseña
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
          alert('Error al registrar el usuario, revisa la consola.');
        }
      });
    }
  }
}
