import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendRequestService } from '../../services/friend-request';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-requests.html',
  styleUrl: './friend-requests.css'
})
export class FriendRequestsComponent implements OnInit {
  pendingRequests: any[] = [];
  mensajeAccion: string = '';
  animatingIds: Set<number> = new Set(); //  Guarda los IDs que se están animando

  constructor(private friendRequestService: FriendRequestService) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.friendRequestService.getPendingRequests().subscribe({
      next: (data) => this.pendingRequests = data,
      error: (err) => console.error('Error cargando solicitudes', err)
    });
  }

  aceptar(id: number) {
    this.animatingIds.add(id); // Activamos la clase CSS de transición suave
    
    this.friendRequestService.acceptRequest(id).subscribe({
      next: () => {
        this.mensajeAccion = '¡Solicitud aceptada! Tienes un nuevo amigo.';
        this.removerDeLista(id);
      },
      error: () => this.animatingIds.delete(id)
    });
  }

  rechazar(id: number) {
    this.animatingIds.add(id); // Activamos la clase CSS de transición suave
    
    this.friendRequestService.rejectRequest(id).subscribe({
      next: () => {
        this.mensajeAccion = 'Solicitud rechazada.';
        this.removerDeLista(id);
      },
      error: () => this.animatingIds.delete(id)
    });
  }

  private removerDeLista(id: number) {
    // ⏱ Esperamos 300ms a que termine la animación CSS antes de quitarlo del HTML
    setTimeout(() => {
      this.pendingRequests = this.pendingRequests.filter(req => req.id !== id);
      this.animatingIds.delete(id);
      
      // Limpiamos el mensaje de éxito después de 3 segundos
      setTimeout(() => this.mensajeAccion = '', 3000);
    }, 300);
  }
}
