import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { XuxemonCardComponent } from '../xuxemon-card/xuxemon-card';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';

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

  constructor(
    private xuxemonService: XuxemonService,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.seoService.update({
      title: 'Xuxedex',
      description: 'Explora tu colección real de Xuxemons, filtra por tipo y revisa tus repetidos.'
    });

    forkJoin({
      catalogo: this.xuxemonService.getXuxemons(),
      coleccion: this.xuxemonService.getMisXuxemons()
    }).subscribe({
      next: ({ catalogo, coleccion }) => {
        // Mezclamos catalogo y coleccion para ver bloqueados, desbloqueados y repetidos en una sola pantalla.
        this.todosXuxemons = this.prepararXuxemons(catalogo, coleccion);
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los xuxemons', err);

        if (err.status !== 401) {
          this.todosXuxemons = [];
          this.aplicarFiltros();
        }

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
        (!!xuxemon.descripcion && xuxemon.descripcion.toLowerCase().includes(texto))
      );
    }

    if (this.filtroTipo !== 'todos') {
      resultado = resultado.filter((xuxemon) => xuxemon.tipo.toLowerCase() === this.filtroTipo);
    }

    if (this.filtroTamano !== 'todos') {
      resultado = resultado.filter((xuxemon) =>
        this.normalizarTamano(xuxemon.tamano) === this.filtroTamano
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

  private prepararXuxemons(catalogo: IXuxemon[], coleccion: IXuxemon[]): IXuxemon[] {
    const coleccionPorId = new Map<number, IXuxemon>(
      coleccion.map((xuxemon) => [xuxemon.id, xuxemon])
    );

    return this.ordenarXuxemons(
      catalogo.map((xuxemon) => {
        const propio = coleccionPorId.get(xuxemon.id);

        return {
            ...xuxemon,
            ...propio,
            // Si lo tiene el usuario, conservamos su estado real: tamano, comidas, enfermedades y cantidad.
            tamano: this.capitalizarTamano(
              this.normalizarTamano(propio?.tamano || xuxemon.tamano)
            ),
          cantidad: propio ? Math.max(1, propio.cantidad || 1) : 0,
          comidas: propio?.comidas ?? 0,
          enfermedades: propio?.enfermedades || [],
          enfermedad: propio?.enfermedad || undefined,
          desbloqueado: !!propio,
          bloqueado: !propio
        };
      })
    );
  }

  private ordenarXuxemons(xuxemons: IXuxemon[]): IXuxemon[] {
    return [...xuxemons].sort((a, b) => {
      const aDesbloqueado = a.desbloqueado ? 1 : 0;
      const bDesbloqueado = b.desbloqueado ? 1 : 0;

      if (aDesbloqueado !== bDesbloqueado) {
        return bDesbloqueado - aDesbloqueado;
      }

      const cantidadA = a.cantidad || 0;
      const cantidadB = b.cantidad || 0;

      if (cantidadA !== cantidadB) {
        return cantidadB - cantidadA;
      }

      return a.id - b.id;
    });
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
