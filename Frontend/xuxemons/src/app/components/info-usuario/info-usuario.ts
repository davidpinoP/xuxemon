import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './info-usuario.component.html',
  styleUrls: ['./info-usuario.component.css']
})
export class InfoUsuarioComponent implements OnInit {
  
  user: any = {
    name: '',
    surname: '',
    email: '',
    player_id: ''
  };

  constructor(
    private userService: UserService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (data: any) => {  // <--- Añadido ": any"
        this.user = data;
      },
      error: (err: any) => {  // <--- Añadido ": any"
        console.error('Error al obtener el perfil', err);
      }
    });
  }

  saveProfile(): void {
    this.userService.updateProfile(this.user).subscribe({
      next: () => {  // <--- Quitamos "res" porque no lo usábamos
        alert('Perfil actualizado correctamente');
      },
      error: (err: any) => {  // <--- Añadido ": any"
        alert('Error al actualizar los datos');
      }
    });
  }

  confirmDeactivate(): void {
    const confirmacion = confirm('¿Estás seguro de que quieres darte de baja? No podrás volver a entrar.');
    
    if (confirmacion) {
      this.userService.deactivateAccount().subscribe({
        next: () => {
          alert('Cuenta desactivada correctamente.');
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {  // <--- Añadido ": any"
          alert('Hubo un error al intentar darte de baja.');
        }
      });
    }
  }
}