import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {


  formulariLogin = new FormGroup({
    player_id: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  error_msg: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Entrar',
      description: 'Inicia sesion en Xuxemons con tu Player ID y vuelve a tu aventura.'
    });
  }

  Submit() {
    if (this.formulariLogin.valid) {
      // Enviamos al backend exactamente las dos credenciales que usa el juego: player_id y password.
      const credentials = {
        player_id: this.formulariLogin.value.player_id,
        password: this.formulariLogin.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Si el login va bien, guardamos sesion y redirigimos a la pagina principal.
          this.authService.saveToken(response.access_token);
          if (response.user && response.user.role) {
            localStorage.setItem('userRole', response.user.role);
          }
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en el login', err);
          this.error_msg = 'Credenciales incorrectas. Por favor, intentalo de nuevo.';
        }
      });
    }
  }

  goToRegister() {
    // Este boton solo cambia de vista; no hace ninguna llamada al backend.
    this.router.navigate(['/register']);
  }
}
