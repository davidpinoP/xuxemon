import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './info-usuario.html',
  styleUrls: ['./info-usuario.css']
})
export class InfoUsuarioComponent implements OnInit {
  
  user: any = {
    name: '',
    surname: '',
    email: '',
    player_id: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => this.user = data,
      error: (err: any) => console.error('Error al obtener el perfil', err)
    });
  }

  saveProfile(): void {
    this.authService.updateProfile(this.user).subscribe({
      next: () => alert('Perfil actualizado correctamente'),
      error: (err: any) => alert('Error al actualizar los datos')
    });
  }

  confirmDeactivate(): void {
    const confirmacion = confirm('¿Estás seguro de que quieres darte de baja? No podrás volver a entrar.');
    
    if (confirmacion) {
      this.authService.deactivateAccount().subscribe({
        next: () => {
          alert('Cuenta desactivada correctamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err: any) => alert('Hubo un error al intentar darte de baja.')
      });
    }
  }
}