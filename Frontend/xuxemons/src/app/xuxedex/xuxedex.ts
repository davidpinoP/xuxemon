import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { XuxemonCardComponent } from '../xuxemon-card/xuxemon-card';
import { SidebarComponent } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule, XuxemonCardComponent, RouterModule, SidebarComponent],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css',
})
export class Xuxedex implements OnInit {
  todosXuxemons: IXuxemon[] = [];
  xuxemons: IXuxemon[] = [];
  cargando = true;

  textoBusqueda = '';
  filtroTipo = 'todos';
  filtroTamano = 'todos';
  filtroEstado = 'todos';

  tiposDisponibles: string[] = ['todos', 'agua', 'tierra', 'aire'];
  tamanosDisponibles: string[] = ['todos', 'pequeno', 'mediano', 'grande'];

  constructor(private xuxemonService: XuxemonService, private router: Router) {}

  ngOnInit(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: IXuxemon[]) => {
        this.todosXuxemons = data.length > 0 ? this.prepararXuxemons(data) : this.getDatosEjemplo();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los xuxemons', err);
        this.todosXuxemons = this.getDatosEjemplo();
        this.aplicarFiltros();
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.todosXuxemons];

    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase().trim();
      resultado = resultado.filter((xuxemon) =>
        xuxemon.nombre.toLowerCase().includes(texto) ||
        (this.estaDesbloqueado(xuxemon) && !!xuxemon.descripcion && xuxemon.descripcion.toLowerCase().includes(texto))
      );
    }

    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter((xuxemon) => xuxemon.tipo.toLowerCase() === this.filtroTipo);
    }

    if (this.filtroTamano !== 'todos') {
      resultado = resultado.filter((xuxemon) =>
        this.estaDesbloqueado(xuxemon) && this.normalizarTamano(xuxemon.tamano) === this.filtroTamano
      );
    }

    this.xuxemons = this.ordenarXuxemons(resultado);
  }

  onBuscar(): void {
    this.aplicarFiltros();
  }

  seleccionarTipo(tipo: string): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  seleccionarTamano(tamano: string): void {
    this.filtroTamano = tamano;
    this.aplicarFiltros();
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      agua: '💧',
      tierra: '🌿',
      aire: '💨',
      fuego: '🔥'
    };

    return iconos[tipo.toLowerCase()] || '❔';
  }

  getTipoNombre(tipo: string): string {
    if (tipo === 'todos') return 'Todos';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  private getDatosEjemplo(): IXuxemon[] {
    return this.prepararXuxemons([
      {
        id: 1,
        nombre: 'Aquarion',
        tipo: 'agua',
        tamano: 'Grande',
        descripcion: 'Un xuxemon acuatico que controla las mareas.',
        imagen: '/imagenes/assets/1.png',
        desbloqueado: true,
        bloqueado: false
      },
      {
        id: 2,
        nombre: 'Terrock',
        tipo: 'tierra',
        tamano: 'Mediano',
        descripcion: 'Xuxemon de roca con una defensa impenetrable.',
        imagen: '/imagenes/assets/2.png',
        desbloqueado: true,
        bloqueado: false
      },
      {
        id: 3,
        nombre: 'Ventus',
        tipo: 'aire',
        tamano: 'Pequeno',
        descripcion: 'Xuxemon volador veloz como el viento.',
        imagen: '/imagenes/assets/3.png',
        desbloqueado: false,
        bloqueado: true
      },
      {
        id: 4,
        nombre: 'Ondina',
        tipo: 'agua',
        tamano: 'Pequeno',
        descripcion: 'Xuxemon acuatico agil y jugueton.',
        imagen: '/imagenes/assets/4.png',
        desbloqueado: false,
        bloqueado: true
      }
    ]);
  }

  private prepararXuxemons(xuxemons: IXuxemon[]): IXuxemon[] {
    return this.ordenarXuxemons(
      xuxemons.map((xuxemon) => ({
        ...xuxemon,
        tamano: this.capitalizarTamano(this.normalizarTamano(xuxemon.tamano)),
        desbloqueado: xuxemon.desbloqueado !== false && xuxemon.bloqueado !== true,
        bloqueado: xuxemon.bloqueado === true || xuxemon.desbloqueado === false
      }))
    );
  }

  private ordenarXuxemons(xuxemons: IXuxemon[]): IXuxemon[] {
    return [...xuxemons].sort((a, b) => {
      const desbloqueadoA = this.estaDesbloqueado(a) ? 1 : 0;
      const desbloqueadoB = this.estaDesbloqueado(b) ? 1 : 0;

      if (desbloqueadoA !== desbloqueadoB) {
        return desbloqueadoB - desbloqueadoA;
      }

      return a.id - b.id;
    });
  }

  private estaDesbloqueado(xuxemon: IXuxemon): boolean {
    return xuxemon.desbloqueado !== false && xuxemon.bloqueado !== true;
  }

  private normalizarTamano(tamano?: string): 'pequeno' | 'mediano' | 'grande' {
    const valor = (tamano || 'Pequeno')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (['gran', 'grande'].includes(valor)) {
      return 'grande';
    }

    if (['mediano', 'mediana', 'mitja'].includes(valor)) {
      return 'mediano';
    }

    return 'pequeno';
  }

  private capitalizarTamano(tamano: 'pequeno' | 'mediano' | 'grande'): string {
    if (tamano === 'grande') return 'Grande';
    if (tamano === 'mediano') return 'Mediano';
    return 'Pequeno';
  }
}
