import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-xuxedex',
  imports: [CommonModule, FormsModule],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css',
})
export class Xuxedex implements OnInit {
  // Lista completa de xuxemons (sin filtrar)
  todosXuxemons: IXuxemon[] = [];
  // Lista filtrada que se muestra en pantalla
  xuxemons: IXuxemon[] = [];
  cargando: boolean = true;

  // Filtros
  textoBusqueda: string = '';
  filtroTipo: string = 'todos';
  filtroEstado: string = 'todos';

  // Tipos disponibles para los filtros
  tiposDisponibles: string[] = ['todos', 'agua', 'tierra', 'aire'];

  constructor(private xuxemonService: XuxemonService, private router: Router) { }

  ngOnInit(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: IXuxemon[]) => {
        if (data.length === 0) {
          this.cargarDatosEjemplo();
        } else {
          this.todosXuxemons = data;
        }
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los xuxemons', err);
        this.cargarDatosEjemplo();
        this.aplicarFiltros();
        this.cargando = false;
      }
    });
  }

  // Datos de ejemplo cuando la API no devuelve resultados
  cargarDatosEjemplo(): void {
    this.todosXuxemons = [
      { id: 1, nombre: 'Ballena', tipo: 'agua', descripcion: 'Un xuxemon acuatico gigante que surca los oceanos.', imagen: 'https://img.pokemondb.net/sprites/home/normal/wailmer.png' },
      { id: 2, nombre: 'Tortuga', tipo: 'tierra', descripcion: 'Xuxemon terrestre con un caparazon resistente.', imagen: 'https://img.pokemondb.net/sprites/home/normal/turtwig.png' },
      { id: 3, nombre: 'Loro', tipo: 'aire', descripcion: 'Xuxemon volador con un canto melodioso y potente.', imagen: 'https://img.pokemondb.net/sprites/home/normal/chatot.png' },
      { id: 4, nombre: 'Delfin', tipo: 'agua', descripcion: 'Xuxemon acuatico agil y jugueton.', imagen: 'https://img.pokemondb.net/sprites/home/normal/piplup.png' },
      { id: 5, nombre: 'Aguila', tipo: 'aire', descripcion: 'Xuxemon volador veloz como un relampago.', imagen: 'https://img.pokemondb.net/sprites/home/normal/pidgeotto.png' },
      { id: 6, nombre: 'Roca', tipo: 'tierra', descripcion: 'Xuxemon solido como una montana, defensa impenetrable.', imagen: 'https://img.pokemondb.net/sprites/home/normal/geodude.png' },
    ];
  }

  // Aplica todos los filtros activos sobre la lista completa
  aplicarFiltros(): void {
    let resultado = [...this.todosXuxemons];

    // Filtrar por texto de busqueda
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(x =>
        x.nombre.toLowerCase().includes(texto) ||
        (x.descripcion && x.descripcion.toLowerCase().includes(texto))
      );
    }

    // Filtrar por tipo
    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter(x =>
        x.tipo.toLowerCase() === this.filtroTipo
      );
    }

    this.xuxemons = resultado;
  }

  // Se ejecuta al escribir en el buscador
  onBuscar(): void {
    this.aplicarFiltros();
  }

  // Se ejecuta al clickar un filtro de tipo
  seleccionarTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  // Devuelve el icono emoji segun el tipo
  getTipoIcon(tipo: string): string {
    if (!tipo) return '?';
    switch (tipo.toLowerCase()) {
      case 'agua': return '💧';
      case 'tierra': return '🪨';
      case 'aire': return '💨';
      default: return '⚪';
    }
  }

  // Devuelve el nombre del tipo con la primera letra en mayuscula
  getTipoNombre(tipo: string): string {
    if (!tipo) return 'Desconocido';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  // Devuelve la clase CSS segun el tipo para colorear la tarjeta
  getTipoClase(tipo: string): string {
    if (!tipo) return 'tipo-desconocido';
    return 'tipo-' + tipo.toLowerCase();
  }

  // Genera estadisticas decorativas a partir del id del xuxemon
  // (simulacion hasta que se añadan al backend)
  getStat(id: number, stat: string): number {
    // Genera un valor entre 30 y 100 basado en el id y el stat
    const semilla = id * 31;
    switch (stat) {
      case 'vida': return 40 + (semilla % 61);
      case 'ataque': return 30 + ((semilla * 7) % 71);
      case 'defensa': return 35 + ((semilla * 13) % 66);
      case 'velocidad': return 25 + ((semilla * 19) % 76);
      default: return 50;
    }
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }
}
