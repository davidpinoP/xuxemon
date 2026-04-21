import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, tap } from 'rxjs';
import {
  FriendSearchUser,
  FriendsService,
  PendingFriendRequest
} from '../services/friends.service';
import { FriendSearchComponent } from '../components/friend-search/friend-search';

interface FriendCard {
  id: number;
  name: string;
  playerId: string;
  canAdd: boolean;
  requestSent: boolean;
}

interface RequestCard {
  id: number;
  name: string;
  playerId: string;
}

import { SidebarComponent } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-friends-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, FriendSearchComponent],
  templateUrl: './friends-basic.html',
  styleUrl: './friends-basic.css'
})
export class FriendsBasic implements OnInit {
  searchControl = new FormControl('', { nonNullable: true });
  buscando = false;
  mensaje = 'Escribe 3 caracteres o mas para buscar por ID.';
  resultados: FriendCard[] = [];
  tarjetasVisibles: FriendCard[] = [];
  solicitudesPendientes: RequestCard[] = [];
  amigosReales: FriendCard[] = [];
  procesandoSolicitudIds = new Set<number>();
  eliminandoAmigoIds = new Set<number>();

  constructor(private friendsService: FriendsService) {}

  ngOnInit(): void {
    this.cargarAmigos();
    this.cargarSolicitudesPendientes();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((value) => value.trim()),
        tap((texto) => {
          if (texto.length >= 3) {
            return;
          }

          this.resultados = [];
          this.tarjetasVisibles = this.amigosReales;
          this.buscando = false;
          this.mensaje = 'Escribe 3 caracteres o mas para buscar por ID.';
          this.friendsService.clearSearchResults();
        }),
        filter((texto) => texto.length >= 3)
      )
      .subscribe((texto) => {
        this.buscarUsuarios(texto);
      });
  }

  private cargarAmigos(): void {
    this.friendsService.getFriends().subscribe({
      next: (friends: FriendSearchUser[]) => {
        this.amigosReales = friends.map((f) => ({
          id: f.id,
          name: `${f.name} ${f.surname}`.trim(),
          playerId: f.player_id,
          canAdd: false,
          requestSent: false
        }));
        // Solo actualizamos tarjetasVisibles si no estamos en una búsqueda activa
        if (this.searchControl.value.trim().length < 3) {
          this.tarjetasVisibles = this.amigosReales;
        }
      },
      error: () => {
        this.amigosReales = [];
        this.tarjetasVisibles = [];
      }
    });
  }

  private buscarUsuarios(query: string): void {
    this.buscando = true;
    this.mensaje = 'Buscando usuarios...';

    this.friendsService.searchUsers(query).subscribe({
      next: (users: FriendSearchUser[]) => {
        this.resultados = users.map((user) => ({
          id: user.id,
          name: `${user.name} ${user.surname}`.trim(),
          playerId: user.player_id,
          canAdd: true,
          requestSent: false
        }));
        this.tarjetasVisibles = this.resultados;

        this.buscando = false;
        this.mensaje =
          this.resultados.length > 0
            ? `${this.resultados.length} usuario(s) encontrado(s).`
            : 'No se han encontrado usuarios.';
      },
      error: () => {
        this.resultados = [];
        this.tarjetasVisibles = [];
        this.buscando = false;
        this.mensaje = 'No se ha podido realizar la busqueda.';
      }
    });
  }

  private cargarSolicitudesPendientes(): void {
    this.friendsService.getPendingFriendRequests().subscribe({
      next: (requests: PendingFriendRequest[]) => {
        this.solicitudesPendientes = requests.map((request) => ({
          id: request.id,
          name: `${request.sender.name} ${request.sender.surname}`.trim(),
          playerId: request.sender.player_id,
        }));
      },
      error: () => {
        this.solicitudesPendientes = [];
      }
    });
  }

  enviarSolicitud(card: FriendCard): void {
    if (!card.canAdd || card.requestSent) {
      return;
    }

    this.friendsService.sendFriendRequest(card.id).subscribe({
      next: (response) => {
        card.requestSent = true;
        alert(response.message);
      },
      error: (error) => {
        const message = error?.error?.message || 'No se ha podido enviar la solicitud.';
        alert(message);
      }
    });
  }

  aceptarSolicitud(requestCard: RequestCard): void {
    this.friendsService.acceptFriendRequest(requestCard.id).subscribe({
      next: (response) => {
        this.procesandoSolicitudIds.add(requestCard.id);
        setTimeout(() => {
          this.cargarSolicitudesPendientes();
          this.cargarAmigos();
          this.procesandoSolicitudIds.delete(requestCard.id);
          alert(response.message);
        }, 300);
      },
      error: (error) => {
        this.procesandoSolicitudIds.delete(requestCard.id);
        const message = error?.error?.message || 'No se ha podido aceptar la solicitud.';
        alert(message);
      }
    });
  }

  rechazarSolicitud(requestCard: RequestCard): void {
    this.friendsService.rejectFriendRequest(requestCard.id).subscribe({
      next: (response) => {
        this.procesandoSolicitudIds.add(requestCard.id);
        setTimeout(() => {
          this.cargarSolicitudesPendientes();
          this.cargarAmigos();
          this.procesandoSolicitudIds.delete(requestCard.id);
          alert(response.message);
        }, 300);
      },
      error: (error) => {
        this.procesandoSolicitudIds.delete(requestCard.id);
        const message = error?.error?.message || 'No se ha podido rechazar la solicitud.';
        alert(message);
      }
    });
  }

  eliminarAmigo(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar a este amigo?')) {
      this.eliminandoAmigoIds.add(id);
      this.friendsService.deleteFriend(id).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.cargarAmigos();
            this.eliminandoAmigoIds.delete(id);
            alert(response.message);
          }, 300);
        },
        error: (error) => {
          this.eliminandoAmigoIds.delete(id);
          const message = error?.error?.message || 'No se ha podido eliminar al amigo.';
          alert(message);
        }
      });
    }
  }
}
