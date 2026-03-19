import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';

// Importamos el nuevo componente de la tarjeta (asegúrate de que la ruta sea correcta)
import { XuxemonCardComponent } from '../xuxemon-card/xuxemon-card';

@Component({
  selector: 'app-xuxedex',
  standalone: true, // Necesario para cargar imports aquí
  imports: [CommonModule, FormsModule, XuxemonCardComponent, RouterModule], // Añadimos la tarjeta aquí
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
  filtroTamano: string = 'todos';
  filtroEstado: string = 'todos';

  // Tipos y tamaños disponibles para los filtros
  tiposDisponibles: string[] = ['todos', 'agua', 'tierra', 'aire'];
  tamanosDisponibles: string[] = ['todos', 'pequeño', 'mediano', 'grande'];

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
      { id: 1, nombre: 'Aquarion', tipo: 'agua', tamano: 'grande', descripcion: 'Un xuxemon acuatico que controla las mareas.', imagen: '/imagenes/assets/1.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 2, nombre: 'Terrock', tipo: 'tierra', tamano: 'mediano', descripcion: 'Xuxemon de roca con una defensa impenetrable.', imagen: '/imagenes/assets/2.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 3, nombre: 'Ventus', tipo: 'aire', tamano: 'pequeño', descripcion: 'Xuxemon volador veloz como el viento.', imagen: '/imagenes/assets/3.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 4, nombre: 'Ondina', tipo: 'agua', tamano: 'pequeño', descripcion: 'Xuxemon acuatico agil y jugueton.', imagen: '/imagenes/assets/4.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 5, nombre: 'Pedregal', tipo: 'tierra', tamano: 'grande', descripcion: 'Xuxemon terrestre solido como una montana.', imagen: '/imagenes/assets/5.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 6, nombre: 'Cielix', tipo: 'aire', tamano: 'mediano', descripcion: 'Surca los cielos con un canto melodioso.', imagen: '/imagenes/assets/6.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 7, nombre: 'Mareton', tipo: 'agua', tamano: 'grande', descripcion: 'Gigante de las profundidades marinas.', imagen: '/imagenes/assets/7.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 8, nombre: 'Dunarex', tipo: 'tierra', tamano: 'mediano', descripcion: 'Xuxemon del desierto con armadura de arena.', imagen: '/imagenes/assets/8.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 9, nombre: 'Plumyx', tipo: 'aire', tamano: 'pequeño', descripcion: 'Xuxemon con plumas que brillan al sol.', imagen: '/imagenes/assets/9.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 10, nombre: 'Torrentis', tipo: 'agua', tamano: 'mediano', descripcion: 'Controla las corrientes de los rios.', imagen: '/imagenes/assets/10.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 11, nombre: 'Gravix', tipo: 'tierra', tamano: 'grande', descripcion: 'Xuxemon que manipula la gravedad a su alrededor.', imagen: '/imagenes/assets/11.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 12, nombre: 'Zefyra', tipo: 'aire', tamano: 'mediano', descripcion: 'Crea tornados con un aleteo de sus alas.', imagen: '/imagenes/assets/12.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 13, nombre: 'Coralix', tipo: 'agua', tamano: 'pequeño', descripcion: 'Xuxemon marino protector de los arrecifes.', imagen: '/imagenes/assets/13.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 14, nombre: 'Montaraz', tipo: 'tierra', tamano: 'grande', descripcion: 'Habita en las cumbres mas altas.', imagen: '/imagenes/assets/14.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 15, nombre: 'Huracan', tipo: 'aire', tamano: 'mediano', descripcion: 'El xuxemon mas rapido de los cielos.', imagen: '/imagenes/assets/15.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 16, nombre: 'Neptux', tipo: 'agua', tamano: 'grande', descripcion: 'Xuxemon guardian de las aguas profundas.', imagen: '/imagenes/assets/16.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 17, nombre: 'Arenix', tipo: 'tierra', tamano: 'mediano', descripcion: 'Se camufla perfectamente en el desierto.', imagen: '/imagenes/assets/17.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 18, nombre: 'Brisax', tipo: 'aire', tamano: 'pequeño', descripcion: 'Genera brisas refrescantes a su paso.', imagen: '/imagenes/assets/18.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 19, nombre: 'Olearis', tipo: 'agua', tamano: 'grande', descripcion: 'Cabalga sobre olas gigantes con elegancia.', imagen: '/imagenes/assets/19.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 20, nombre: 'Crestón', tipo: 'tierra', tamano: 'mediano', descripcion: 'Su cresta de piedra corta el acero.', imagen: '/imagenes/assets/20.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 21, nombre: 'Ciclonix', tipo: 'aire', tamano: 'mediano', descripcion: 'Envuelve a sus rivales en un ciclon imparable.', imagen: '/imagenes/assets/21.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 22, nombre: 'Glacius', tipo: 'agua', tamano: 'grande', descripcion: 'Congela todo a su alrededor con su aliento.', imagen: '/imagenes/assets/22.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 23, nombre: 'Magmax', tipo: 'tierra', tamano: 'grande', descripcion: 'Xuxemon volcanico que expulsa rocas fundidas.', imagen: '/imagenes/assets/23.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 24, nombre: 'Stratox', tipo: 'aire', tamano: 'mediano', descripcion: 'Vuela tan alto que roza la estratosfera.', imagen: '/imagenes/assets/24.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 25, nombre: 'Riachux', tipo: 'agua', tamano: 'pequeño', descripcion: 'Pequeno pero con corrientes muy fuertes.', imagen: '/imagenes/assets/25.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 26, nombre: 'Sismix', tipo: 'tierra', tamano: 'grande', descripcion: 'Sus pisadas provocan temblores de tierra.', imagen: '/imagenes/assets/26.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 27, nombre: 'Alaris', tipo: 'aire', tamano: 'pequeño', descripcion: 'Sus alas despliegan un brillo dorado.', imagen: '/imagenes/assets/27.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 28, nombre: 'Abismal', tipo: 'agua', tamano: 'grande', descripcion: 'Vive en las fosas marinas mas oscuras.', imagen: '/imagenes/assets/28.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 29, nombre: 'Cantrex', tipo: 'tierra', tamano: 'mediano', descripcion: 'Xuxemon formado por cristales de cuarzo.', imagen: '/imagenes/assets/29.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 30, nombre: 'Tifonis', tipo: 'aire', tamano: 'grande', descripcion: 'Desatara tifones con su cola en espiral.', imagen: '/imagenes/assets/30.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 31, nombre: 'Manglar', tipo: 'agua', tamano: 'mediano', descripcion: 'Protector de los manglares costeros.', imagen: '/imagenes/assets/31.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 32, nombre: 'Fosilus', tipo: 'tierra', tamano: 'grande', descripcion: 'Xuxemon ancestral despertado de un fosil.', imagen: '/imagenes/assets/32.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 33, nombre: 'Boreasix', tipo: 'aire', tamano: 'mediano', descripcion: 'Trae el viento del norte helado.', imagen: '/imagenes/assets/33.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 34, nombre: 'Cascadix', tipo: 'agua', tamano: 'grande', descripcion: 'Lanza chorros de agua a gran presion.', imagen: '/imagenes/assets/34.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 35, nombre: 'Talux', tipo: 'tierra', tamano: 'mediano', descripcion: 'Xuxemon minero que excava tuneles sin parar.', imagen: '/imagenes/assets/35.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 36, nombre: 'Neblux', tipo: 'aire', tamano: 'pequeño', descripcion: 'Se oculta entre la niebla para atacar.', imagen: '/imagenes/assets/36.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 37, nombre: 'Vaporus', tipo: 'agua', tamano: 'pequeño', descripcion: 'Se transforma en vapor para esquivar ataques.', imagen: '/imagenes/assets/37.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 38, nombre: 'Geodus', tipo: 'tierra', tamano: 'grande', descripcion: 'Tiene gemas incrustadas en su espalda.', imagen: '/imagenes/assets/38.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 39, nombre: 'Aeronix', tipo: 'aire', tamano: 'pequeño', descripcion: 'Su vuelo es silencioso como la noche.', imagen: '/imagenes/assets/39.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 40, nombre: 'Deltix', tipo: 'agua', tamano: 'mediano', descripcion: 'Habita en los deltas donde el rio encuentra el mar.', imagen: '/imagenes/assets/40.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 41, nombre: 'Petrax', tipo: 'tierra', tamano: 'grande', descripcion: 'Su piel es dura como el granito pulido.', imagen: '/imagenes/assets/41.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 42, nombre: 'Galernix', tipo: 'aire', tamano: 'grande', descripcion: 'Provoca galernas en las costas con su aleteo.', imagen: '/imagenes/assets/42.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 43, nombre: 'Espumax', tipo: 'agua', tamano: 'pequeño', descripcion: 'Cubre todo de espuma marina al luchar.', imagen: '/imagenes/assets/43.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 44, nombre: 'Obsidux', tipo: 'tierra', tamano: 'mediano', descripcion: 'Forjado en obsidiana volcanica milenaria.', imagen: '/imagenes/assets/44.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 45, nombre: 'Cumulix', tipo: 'aire', tamano: 'pequeño', descripcion: 'Se posa sobre las nubes para descansar.', imagen: '/imagenes/assets/45.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 46, nombre: 'Tsunamix', tipo: 'agua', tamano: 'grande', descripcion: 'Desata tsunamis cuando se enfada.', imagen: '/imagenes/assets/46.png', created_at: '2024-01-01', updated_at: '2024-01-01' },
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

    // Filtrar por tamaño
    if (this.filtroTamano !== 'todos') {
      resultado = resultado.filter(x =>
        x.tamano?.toLowerCase() === this.filtroTamano
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

  // Se ejecuta al clickar un filtro de tamaño
  seleccionarTamano(tamano: string): void {
    this.filtroTamano = tamano;
    this.aplicarFiltros();
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'agua': '💧',
      'tierra': '🌿',
      'aire': '💨',
      'fuego': '🔥'
    };
    return iconos[tipo.toLowerCase()] || '❓';
  }

  getTipoNombre(tipo: string): string {
    if (tipo === 'todos') return 'Todos';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }
  irAXuxedex(): void {
    this.router.navigate(['/xuxedex']);
  }

  irAMochila(): void {
    this.router.navigate(['/mochila']);
  }

  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}