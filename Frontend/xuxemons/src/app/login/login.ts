import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {


  formulariLogin = new FormGroup({
    player_id: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService, private router: Router) { }

  Submit() {
    if (this.formulariLogin.valid) {
      const credentials = {
        player_id: this.formulariLogin.value.player_id,
        password: this.formulariLogin.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          this.authService.saveToken(response.access_token);
          alert('¡Login completado con éxito!');
        },
        error: (err) => {
          console.error('Error en el login', err);
          alert('Credenciales incorrectas');
        }
      });
    }
  }
}
