import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FriendSearchUser, FriendsService } from '../services/friends.service';

interface FriendCard {
  id: number;
  name: string;
  playerId: string;
  canAdd: boolean;
  requestSent: boolean;
}

@Component({
  selector: 'app-friends-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './friends-basic.html',
  styleUrl: './friends-basic.css'
})
export class FriendsBasic implements OnInit {
  searchControl = new FormControl('', { nonNullable: true });
  buscando = false;
  mensaje = 'Escribe 3 caracteres o mas para buscar por ID.';
  resultados: FriendCard[] = [];
  tarjetasVisibles: FriendCard[] = [];

  amigosDemo: FriendCard[] = [
    { id: 1, name: 'Laura', playerId: '#Laura1204', canAdd: false, requestSent: false },
    { id: 2, name: 'Rivers', playerId: '#Rivers8821', canAdd: false, requestSent: false },
    { id: 3, name: 'Maria', playerId: '#Maria4500', canAdd: false, requestSent: false },
    { id: 4, name: 'Paulita', playerId: '#Paulita1122', canAdd: true, requestSent: false },
    { id: 5, name: 'Isabela', playerId: '#Isabela7780', canAdd: false, requestSent: false },
    { id: 6, name: 'Lucia', playerId: '#Lucia3001', canAdd: true, requestSent: false }
  ];

  constructor(private friendsService: FriendsService) {}

  ngOnInit(): void {
    this.tarjetasVisibles = this.amigosDemo;

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        const texto = value.trim();

        if (texto.length < 3) {
          this.resultados = [];
          this.tarjetasVisibles = this.amigosDemo;
          this.buscando = false;
          this.mensaje = 'Escribe 3 caracteres o mas para buscar por ID.';
          this.friendsService.clearSearchResults();
          return;
        }

        this.buscarUsuarios(texto);
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
}
