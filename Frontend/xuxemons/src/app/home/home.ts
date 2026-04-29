import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: any = null;
  equipo: IXuxemon[] = [];

  constructor(
    private authService: AuthService,
    private xuxemonService: XuxemonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        this.cargarEquipo();
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
        this.cargarEquipo();
      }
    });
  }

  cargarEquipo(): void {
    this.xuxemonService.getMisXuxemons().subscribe({
      next: (xuxemons: IXuxemon[]) => {
        this.equipo = xuxemons.slice(0, 4);
      },
      error: (err: any) => {
        console.error('Error cargando xuxemons', err);
        this.equipo = [];
      }
    });
  }

  getImagen(xuxemon: IXuxemon): string {
    return this.normalizarImagen(xuxemon.imagen) || `/imagenes/assets/${xuxemon.id}.webp`;
  }

  private normalizarImagen(ruta?: string): string | undefined {
    if (!ruta) return undefined;
    return ruta.trim().replace(/\.png$/i, '.webp');
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
