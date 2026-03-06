import { Component, OnInit } from '@angular/core';
import { XuxemonService } from '../services/xuxemon.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-xuxedex',
  imports: [],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css',
})
export class Xuxedex implements OnInit {
  xuxemons: any[] = [];
  cargando: boolean = true;

  constructor(private xuxemonService: XuxemonService, private router: Router) { }

  ngOnInit(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.cargarDatosEjemplo();
        } else {
          this.xuxemons = data;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los xuxemons', err);
        this.cargarDatosEjemplo();
        this.cargando = false;
      }
    });
  }

  cargarDatosEjemplo() {
    this.xuxemons = [
      { id: 1, nombre: 'Ballena', tipo: 'agua', imagen: 'https://img.pokemondb.net/sprites/home/normal/wailmer.png' },
      { id: 2, nombre: 'Tortuga', tipo: 'planta', imagen: 'https://img.pokemondb.net/sprites/home/normal/turtwig.png' },
      { id: 3, nombre: 'Loro', tipo: 'aire', imagen: 'https://img.pokemondb.net/sprites/home/normal/chatot.png' },
      { id: 4, nombre: '', tipo: '?', imagen: '' },
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

  volverHome() {
    this.router.navigate(['/home']);
  }
}
