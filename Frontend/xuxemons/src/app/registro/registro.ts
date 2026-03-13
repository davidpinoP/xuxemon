import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Validador reactivo para comparar contraseñas
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmar_password');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  FormularioRegistro = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmar_password: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  error_msg: string = '';

  error_msg: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  // Generación ID visual para la rúbrica (#Nom0000)
  get generatedId(): string {
    const nombre = this.FormularioRegistro.get('nombre')?.value || '';
    return nombre ? `#${nombre}0000` : '';
  }

  Submit() {
    if (this.FormularioRegistro.valid) {
      const userData = {
        name: this.FormularioRegistro.value.nombre,
        surname: this.FormularioRegistro.value.apellidos,
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
