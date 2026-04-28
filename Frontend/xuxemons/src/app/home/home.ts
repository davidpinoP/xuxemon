import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: any = null;
  equipo: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Inicio',
      description: 'Bienvenido a tu panel principal de Xuxemons con tu equipo destacado y progreso.'
    });

    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        // TODO: Cargar equipo real del usuario desde el backend
        this.cargarEquipoEjemplo();
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
        this.cargarEquipoEjemplo();
      }
    });
  }

  cargarEquipoEjemplo() {
    this.equipo = [
      { id: 1, nombre: 'Loro', tipo: 'aire', imagen: '/imagenes/assets/1.png' },
      { id: 2, nombre: 'Tortuga', tipo: 'planta', imagen: '/imagenes/assets/2.png' },
      { id: 3, nombre: 'Ballena', tipo: 'agua', imagen: '/imagenes/assets/3.png' },
      { id: 4, nombre: 'Caracol', tipo: 'agua', imagen: '/imagenes/assets/4.png' },
    ];
  }

  getTipoIcon(tipo: string): string {
    if (!tipo) return '?';
    switch (tipo.toLowerCase()) {
      case 'agua': return '💧';
      case 'fuego': return '🔥';
      case 'planta': return '🌱';
      case 'electrico': return '⚡';
      case 'tierra': return '🪨';
      case 'aire': return '💨';
      default: return '⚪';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
