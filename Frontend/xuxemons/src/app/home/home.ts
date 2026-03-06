import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: any = null;
  equipo: any[] = [];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
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
      { id: 1, nombre: 'Loro', tipo: 'aire', imagen: 'https://img.pokemondb.net/sprites/home/normal/chatot.png' },
      { id: 2, nombre: 'Tortuga', tipo: 'planta', imagen: 'https://img.pokemondb.net/sprites/home/normal/turtwig.png' },
      { id: 3, nombre: 'Ballena', tipo: 'agua', imagen: 'https://img.pokemondb.net/sprites/home/normal/wailmer.png' },
      { id: 4, nombre: 'Caracol', tipo: 'agua', imagen: 'https://img.pokemondb.net/sprites/home/normal/magcargo.png' },
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
