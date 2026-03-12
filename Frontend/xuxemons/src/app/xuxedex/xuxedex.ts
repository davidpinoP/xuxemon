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
      { id: 1, nombre: 'Aquarion', tipo: 'agua', descripcion: 'Un xuxemon acuatico que controla las mareas.', imagen: '/imagenes/assets/1.png' },
      { id: 2, nombre: 'Terrock', tipo: 'tierra', descripcion: 'Xuxemon de roca con una defensa impenetrable.', imagen: '/imagenes/assets/2.png' },
      { id: 3, nombre: 'Ventus', tipo: 'aire', descripcion: 'Xuxemon volador veloz como el viento.', imagen: '/imagenes/assets/3.png' },
      { id: 4, nombre: 'Ondina', tipo: 'agua', descripcion: 'Xuxemon acuatico agil y jugueton.', imagen: '/imagenes/assets/4.png' },
      { id: 5, nombre: 'Pedregal', tipo: 'tierra', descripcion: 'Xuxemon terrestre solido como una montana.', imagen: '/imagenes/assets/5.png' },
      { id: 6, nombre: 'Cielix', tipo: 'aire', descripcion: 'Surca los cielos con un canto melodioso.', imagen: '/imagenes/assets/6.png' },
      { id: 7, nombre: 'Mareton', tipo: 'agua', descripcion: 'Gigante de las profundidades marinas.', imagen: '/imagenes/assets/7.png' },
      { id: 8, nombre: 'Dunarex', tipo: 'tierra', descripcion: 'Xuxemon del desierto con armadura de arena.', imagen: '/imagenes/assets/8.png' },
      { id: 9, nombre: 'Plumyx', tipo: 'aire', descripcion: 'Xuxemon con plumas que brillan al sol.', imagen: '/imagenes/assets/9.png' },
      { id: 10, nombre: 'Torrentis', tipo: 'agua', descripcion: 'Controla las corrientes de los rios.', imagen: '/imagenes/assets/10.png' },
      { id: 11, nombre: 'Gravix', tipo: 'tierra', descripcion: 'Xuxemon que manipula la gravedad a su alrededor.', imagen: '/imagenes/assets/11.png' },
      { id: 12, nombre: 'Zefyra', tipo: 'aire', descripcion: 'Crea tornados con un aleteo de sus alas.', imagen: '/imagenes/assets/12.png' },
      { id: 13, nombre: 'Coralix', tipo: 'agua', descripcion: 'Xuxemon marino protector de los arrecifes.', imagen: '/imagenes/assets/13.png' },
      { id: 14, nombre: 'Montaraz', tipo: 'tierra', descripcion: 'Habita en las cumbres mas altas.', imagen: '/imagenes/assets/14.png' },
      { id: 15, nombre: 'Huracan', tipo: 'aire', descripcion: 'El xuxemon mas rapido de los cielos.', imagen: '/imagenes/assets/15.png' },
      { id: 16, nombre: 'Neptux', tipo: 'agua', descripcion: 'Xuxemon guardian de las aguas profundas.', imagen: '/imagenes/assets/16.png' },
      { id: 17, nombre: 'Arenix', tipo: 'tierra', descripcion: 'Se camufla perfectamente en el desierto.', imagen: '/imagenes/assets/17.png' },
      { id: 18, nombre: 'Brisax', tipo: 'aire', descripcion: 'Genera brisas refrescantes a su paso.', imagen: '/imagenes/assets/18.png' },
      { id: 19, nombre: 'Olearis', tipo: 'agua', descripcion: 'Cabalga sobre olas gigantes con elegancia.', imagen: '/imagenes/assets/19.png' },
      { id: 20, nombre: 'Crestón', tipo: 'tierra', descripcion: 'Su cresta de piedra corta el acero.', imagen: '/imagenes/assets/20.png' },
      { id: 21, nombre: 'Ciclonix', tipo: 'aire', descripcion: 'Envuelve a sus rivales en un ciclon imparable.', imagen: '/imagenes/assets/21.png' },
      { id: 22, nombre: 'Glacius', tipo: 'agua', descripcion: 'Congela todo a su alrededor con su aliento.', imagen: '/imagenes/assets/22.png' },
      { id: 23, nombre: 'Magmax', tipo: 'tierra', descripcion: 'Xuxemon volcanico que expulsa rocas fundidas.', imagen: '/imagenes/assets/23.png' },
      { id: 24, nombre: 'Stratox', tipo: 'aire', descripcion: 'Vuela tan alto que roza la estratosfera.', imagen: '/imagenes/assets/24.png' },
      { id: 25, nombre: 'Riachux', tipo: 'agua', descripcion: 'Pequeno pero con corrientes muy fuertes.', imagen: '/imagenes/assets/25.png' },
      { id: 26, nombre: 'Sismix', tipo: 'tierra', descripcion: 'Sus pisadas provocan temblores de tierra.', imagen: '/imagenes/assets/26.png' },
      { id: 27, nombre: 'Alaris', tipo: 'aire', descripcion: 'Sus alas despliegan un brillo dorado.', imagen: '/imagenes/assets/27.png' },
      { id: 28, nombre: 'Abismal', tipo: 'agua', descripcion: 'Vive en las fosas marinas mas oscuras.', imagen: '/imagenes/assets/28.png' },
      { id: 29, nombre: 'Cantrex', tipo: 'tierra', descripcion: 'Xuxemon formado por cristales de cuarzo.', imagen: '/imagenes/assets/29.png' },
      { id: 30, nombre: 'Tifonis', tipo: 'aire', descripcion: 'Desata tifones con su cola en espiral.', imagen: '/imagenes/assets/30.png' },
      { id: 31, nombre: 'Manglar', tipo: 'agua', descripcion: 'Protector de los manglares costeros.', imagen: '/imagenes/assets/31.png' },
      { id: 32, nombre: 'Fosilus', tipo: 'tierra', descripcion: 'Xuxemon ancestral despertado de un fosil.', imagen: '/imagenes/assets/32.png' },
      { id: 33, nombre: 'Boreasix', tipo: 'aire', descripcion: 'Trae el viento del norte helado.', imagen: '/imagenes/assets/33.png' },
      { id: 34, nombre: 'Cascadix', tipo: 'agua', descripcion: 'Lanza chorros de agua a gran presion.', imagen: '/imagenes/assets/34.png' },
      { id: 35, nombre: 'Talux', tipo: 'tierra', descripcion: 'Xuxemon minero que excava tuneles sin parar.', imagen: '/imagenes/assets/35.png' },
      { id: 36, nombre: 'Neblux', tipo: 'aire', descripcion: 'Se oculta entre la niebla para atacar.', imagen: '/imagenes/assets/36.png' },
      { id: 37, nombre: 'Vaporus', tipo: 'agua', descripcion: 'Se transforma en vapor para esquivar ataques.', imagen: '/imagenes/assets/37.png' },
      { id: 38, nombre: 'Geodus', tipo: 'tierra', descripcion: 'Tiene gemas incrustadas en su espalda.', imagen: '/imagenes/assets/38.png' },
      { id: 39, nombre: 'Aeronix', tipo: 'aire', descripcion: 'Su vuelo es silencioso como la noche.', imagen: '/imagenes/assets/39.png' },
      { id: 40, nombre: 'Deltix', tipo: 'agua', descripcion: 'Habita en los deltas donde el rio encuentra el mar.', imagen: '/imagenes/assets/40.png' },
      { id: 41, nombre: 'Petrax', tipo: 'tierra', descripcion: 'Su piel es dura como el granito pulido.', imagen: '/imagenes/assets/41.png' },
      { id: 42, nombre: 'Galernix', tipo: 'aire', descripcion: 'Provoca galernas en las costas con su aleteo.', imagen: '/imagenes/assets/42.png' },
      { id: 43, nombre: 'Espumax', tipo: 'agua', descripcion: 'Cubre todo de espuma marina al luchar.', imagen: '/imagenes/assets/43.png' },
      { id: 44, nombre: 'Obsidux', tipo: 'tierra', descripcion: 'Forjado en obsidiana volcanica milenaria.', imagen: '/imagenes/assets/44.png' },
      { id: 45, nombre: 'Cumulix', tipo: 'aire', descripcion: 'Se posa sobre las nubes para descansar.', imagen: '/imagenes/assets/45.png' },
      { id: 46, nombre: 'Tsunamix', tipo: 'agua', descripcion: 'Desata tsunamis cuando se enfada.', imagen: '/imagenes/assets/46.png' },
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
