import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { InventoryService, Objeto } from '../services/inventory.service';
import { XuxemonService } from '../services/xuxemon.service';
import { IXuxemon } from '../models/xuxemon.interface';
import { GameConfigService } from '../services/game-config.service';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './mochila.html',
  styleUrl: './mochila.css',
})
export class Mochila implements OnInit {
  slots: (Objeto | null)[] = [];
  inventarioBase: Objeto[] = [];

  // ── Variables del Modal de Alimentación ──
  mostrarModal = false;
  pasoModal = 1;
  misXuxemons: IXuxemon[] = [];
  xuxemonSeleccionado: IXuxemon | null = null;
  xuxeSeleccionada = '';
  cantidadAlimentar = 1;
  mensajeError = '';

  // ── Variables del Modal de Vacunación (Hospital) ──
  mostrarModalVacuna = false;
  xuxemonEnfermoSeleccionado: IXuxemon | null = null;
  vacunaSeleccionada = '';
  mensajeErrorVacuna = '';

  // ── Variables Admin ──
  isAdmin = false;
  players: any[] = [];
  selectedPlayerId: number | null = null;
  tiposXuxe = [
    { nombre: 'Xuxe', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe Caramelo', imagen: '/assets/images/caramel.png' },
    { nombre: 'Xuxe CHOCO', imagen: '/assets/images/choco.png' },
    { nombre: 'Xuxe Menta', imagen: '/assets/images/menta.png' }
  ];
  xuxeToAdd = { nombre: 'Xuxe Caramelo', cantidad: 1 };

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private xuxemonService: XuxemonService,
    private gameConfigService: GameConfigService,
    private seoService: SeoService
  ) { }

  ngOnInit() {
    this.seoService.update({
      title: 'Mochila',
      description: 'Gestiona tu inventario, alimenta a tus Xuxemons y usa vacunas desde la mochila.'
    });

    // Me suscribo al BehaviorSubject para tener siempre la mochila actualizada
    this.inventoryService.slots$.subscribe(slots => {
      this.slots = slots;
    });

    this.cargarInventario();
    this.cargarMisXuxemons();
    this.checkUserRole();
  }

  abrirModal() {
    this.mostrarModal = true;
    this.pasoModal = 1;
    this.mensajeError = '';

    setTimeout(() => {
      const primerCampo = document.getElementById('select-xuxemon') as HTMLElement | null;
      if (primerCampo) {
        primerCampo.focus();
      }
    }, 0);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pasoModal = 1;
    this.xuxemonSeleccionado = null;
    this.xuxeSeleccionada = '';
    this.cantidadAlimentar = 1;
    this.mensajeError = '';
  }

  // 1️⃣ Esta función llama a Laravel (backend) para descargarse toda la mochila del jugador
  cargarInventario() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        const mochila = Array.isArray(user?.mochila) ? user.mochila : [];
        // Transforma los datos crudos del backend en una lista limpia y lista para mostrar
        this.inventarioBase = this.convertirMochilaAObjetos(mochila);
        // Le dice al InventoryService que apile los caramelos de 5 en 5 y ponga el límite a 20 huecos
        this.inventoryService.organizarMochila(this.inventarioBase);
      },
      error: () => {
        this.inventarioBase = [];
        this.inventoryService.organizarMochila(this.inventarioBase);
      }
    });
  }

  cargarMisXuxemons() {
    this.xuxemonService.getMisXuxemons().subscribe({
      next: (xuxemons: IXuxemon[]) => {
        this.misXuxemons = xuxemons;
      },
      error: () => {
        this.misXuxemons = [];
      }
    });
  }

  getXuxesDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Xuxe' && item.cantidad > 0);
  }

  getMaxCantidad(): number {
    const xuxe = this.inventarioBase.find(item => item.nombre === this.xuxeSeleccionada);
    return xuxe ? xuxe.cantidad : 0;
  }

  getImagenXuxe(): string {
    const xuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeSeleccionada);
    return xuxe?.imagen || '';
  }

  irAPreview() {
    this.mensajeError = '';

    if (!this.xuxemonSeleccionado) {
      this.mensajeError = 'Selecciona un Xuxemon';
      return;
    }
    if (!this.xuxeSeleccionada) {
      this.mensajeError = 'Selecciona una Xuxe';
      return;
    }
    if (this.cantidadAlimentar < 1) {
      this.mensajeError = 'La cantidad debe ser al menos 1';
      return;
    }
    if (this.cantidadAlimentar > this.getMaxCantidad()) {
      this.mensajeError = `Solo tienes ${this.getMaxCantidad()} unidades de esa Xuxe`;
      return;
    }

    this.pasoModal = 2;
  }

  volverASeleccion() {
    this.pasoModal = 1;
  }

  // 2️⃣ Comprueba si con los caramelos que le vas a dar ahora mismo, a tu Xuxemon le toca crecer (Evolucionar)
  vaAEvolucionar(): boolean {
    if (!this.xuxemonSeleccionado) {
      return false;
    }

    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar; // Suma de caramelos totales
    const tamanoActual = (this.xuxemonSeleccionado.tamano || 'Pequeño').toLowerCase();
    const thresholds = this.getEvolveThresholds();

    // Si es pequeño y supera el límite, devolverá TRUE (sí evoluciona)
    if (tamanoActual === 'pequeño' && nuevasComidas >= thresholds.toMediano) {
      return true;
    }

    // Si es mediano y supera el límite de los grandes, devuelve TRUE.
    if (tamanoActual === 'mediano' && nuevasComidas >= thresholds.toGrande) {
      return true;
    }

    return false;
  }

  getNuevoTamano(): string {
    if (!this.xuxemonSeleccionado) {
      return '';
    }

    const comidasActuales = this.xuxemonSeleccionado.comidas || 0;
    const nuevasComidas = comidasActuales + this.cantidadAlimentar;
    const thresholds = this.getEvolveThresholds();

    if (nuevasComidas >= thresholds.toGrande) {
      return 'Grande';
    }

    if (nuevasComidas >= thresholds.toMediano) {
      return 'Mediano';
    }

    return this.xuxemonSeleccionado.tamano || 'Pequeño';
  }

  confirmarAlimentacion() {
    if (!this.xuxemonSeleccionado) {
      return;
    }

    this.xuxemonService.alimentarXuxemon(
      this.xuxemonSeleccionado.id,
      this.xuxeSeleccionada,
      this.cantidadAlimentar
    ).subscribe({
      next: (respuesta: any) => {
        const nombre = this.xuxemonSeleccionado?.nombre || 'Tu Xuxemon';
        const mensaje = respuesta?.evoluciono
          ? `${nombre} ha evolucionado a ${respuesta?.xuxemon?.tamano}.`
          : `${nombre} ha sido alimentado correctamente.`;
        const detalles: string[] = [];

        if (respuesta?.se_infecto) {
          detalles.push('Se ha puesto malito (enfermo).');
        }

        this.cargarInventario();
        this.cargarMisXuxemons();
        this.cerrarModal();
        alert(detalles.length ? `${mensaje} ${detalles.join(' ')}` : mensaje);
      },
      error: (error: any) => {
        this.mensajeError = error?.error?.message || 'No se ha podido alimentar al Xuxemon.';
      }
    });
  }

  // ── Métodos del Hospital (Vacunación) ──
  abrirModalVacuna() {
    this.mostrarModalVacuna = true;
    this.mensajeErrorVacuna = '';
    this.xuxemonEnfermoSeleccionado = null;
    this.vacunaSeleccionada = '';
  }

  cerrarModalVacuna() {
    this.mostrarModalVacuna = false;
  }

  getXuxemonsEnfermos(): IXuxemon[] {
    return this.misXuxemons.filter(x => x.enfermedad);
  }

  getVacunasDisponibles(): Objeto[] {
    return this.inventarioBase.filter(item => item.tipo === 'Vacuna' && item.cantidad > 0);
  }

  confirmarCuracion() {
    if (!this.xuxemonEnfermoSeleccionado) {
      this.mensajeErrorVacuna = 'Selecciona un Xuxemon enfermo';
      return;
    }
    if (!this.vacunaSeleccionada) {
      this.mensajeErrorVacuna = 'Selecciona una vacuna';
      return;
    }

    // Reutilizamos alimentarXuxemon ya que el backend ahora distingue vacunas por nombre
    this.xuxemonService.alimentarXuxemon(
      this.xuxemonEnfermoSeleccionado.id,
      this.vacunaSeleccionada,
      1
    ).subscribe({
      next: (resp: any) => {
        alert(resp.message || 'Xuxemon curado correctamente.');
        this.cargarInventario();
        this.cargarMisXuxemons();
        this.cerrarModalVacuna();
      },
      error: (err: any) => {
        this.mensajeErrorVacuna = err?.error?.message || 'Error al curar al Xuxemon.';
      }
    });
  }

  private getEvolveThresholds(): { toMediano: number; toGrande: number } {
    const base = this.gameConfigService.snapshot.evolve_xuxes;
    const safeBase = base > 0 ? base : 3;

    return {
      toMediano: safeBase,
      toGrande: safeBase + 2
    };
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mostrarModal) {
      this.cerrarModal();
    }
    if (this.mostrarModalVacuna) {
      this.cerrarModalVacuna();
    }
  }

  trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const modal = document.querySelector('.modal-contenido') as HTMLElement | null;

    if (!modal) {
      return;
    }

    const focusables = modal.querySelectorAll(
      'button, select, input, [href], textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusables.length === 0) {
      return;
    }

    const primero = focusables[0] as HTMLElement;
    const ultimo = focusables[focusables.length - 1] as HTMLElement;

    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero.focus();
    }
  }

  // 3️⃣ 'El portero de disco': Comprueba a través del servidor (AuthService) qué 'role' tiene la persona conectada.
  // Si el usuario tiene un rol "admin", pone esa variable a 'true' para repintar el HTML y mostrar los secretitos.
  checkUserRole() {
    this.authService.me().subscribe({
      next: (user: any) => {
        this.isAdmin = user.role === 'admin';
        if (this.isAdmin) {
          this.loadPlayers(); // Solo si es admin, se descarga la lista completa de jugadores.
        }
      }
    });
  }

  loadPlayers() {
    this.authService.getUsers().subscribe({
      next: (users: any[]) => {
        this.players = users;
      },
      error: () => {
        this.players = [];
      }
    });
  }

  addXuxesToPlayer() {
    if (!this.selectedPlayerId) return;

    const player = this.players.find(p => p.id === this.selectedPlayerId);
    if (!player) return;

    let inventory = player.inventory || [];
    // 1. Calculamos cuántos slots reales ocupan las xuxes que ya tiene
    const totalSlotsUsed = this.inventoryService.calculateSlotsUsed(inventory);
    // 2. Calculamos los slots libres (máximo 20)
    const availableSlots = 20 - totalSlotsUsed;

    // 3. Si la mochila está llena, cerramos el grifo y descartamos
    if (availableSlots <= 0) {
      alert('La mochila del jugador está llena.');
      return;
    }

    const selectedXuxe = this.tiposXuxe.find(x => x.nombre === this.xuxeToAdd.nombre);

    const newItem: Objeto = {
      nombre: this.xuxeToAdd.nombre,
      tipo: 'Xuxe',
      cantidad: this.xuxeToAdd.cantidad,
      stackable: true,
      imagen: selectedXuxe?.imagen || ''
    };

    // 4. Calculamos cuántos slots nuevos vamos a gastar dividiendo entre 5
    const slotsNeeded = Math.ceil(newItem.cantidad / 5);

    // 5. Si gastamos más huecos de los que tenemos libres, le quitamos el exceso
    if (slotsNeeded > availableSlots) {
      const allowedAmount = availableSlots * 5;
      alert(`Solo caben ${allowedAmount} Xuxes. El resto se descartará.`);
      newItem.cantidad = allowedAmount; // Reemplazamos la cantidad por lo máximo que cabe
    }

    inventory.push(newItem);

    // Guardamos en el backend de Laravel
    this.authService.updateUserInventory(player.id, inventory).subscribe({
      next: () => {
        alert('Xuxes añadidas correctamente.');
        this.loadPlayers();
      },
      error: () => alert('Error al actualizar el inventario.')
    });
  }


  // Coge el mogollón de datos que viene de la BBDD de Laravel y le añade propiedades clave visuales para nosotros.
  private convertirMochilaAObjetos(mochila: any[]): Objeto[] {
    const objetos: Objeto[] = [];

    for (const item of mochila) {
      if (item?.tipo === 'xuxemon') {
        continue; // Ignoramos a los bichos vivos, esto es el inventario de la mochila
      }

      const nombre = item?.nombre || 'Item';
      // MIRA AQUÍ: Aquí es donde detecta si lleva la palabra "vacuna" en la BBDD
      const esVacuna = nombre.toLowerCase().includes('vacuna');

      objetos.push({
        nombre,
        tipo: esVacuna ? 'Vacuna' : 'Xuxe',
        cantidad: Number(item?.cantidad || 1),
        // MIRA AQUÍ 2: Como stackable (apilable) significa que NO es vacuna, 
        // le pone 'false' y luego el InventoryService jamás las amontonará.
        stackable: !esVacuna,
        imagen: this.obtenerImagenItem(nombre), // Llama a la función de abajo y le inserta su dibujito
      });
    }

    return objetos;
  }

  private obtenerImagenItem(nombre: string): string {
    const nombreNormalizado = nombre.toLowerCase();

    if (nombreNormalizado.includes('choco')) {
      return '/assets/images/choco.png';
    }

    if (nombreNormalizado.includes('menta')) {
      return '/assets/images/menta.png';
    }

    if (nombreNormalizado.includes('vacuna')) {
      return '/assets/images/nube.png';
    }

    return '/assets/images/caramel.png';
  }
}
