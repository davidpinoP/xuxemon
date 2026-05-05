import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface FriendSearchUser {
  id: number;
  name: string;
  surname: string;
  player_id: string;
}

export interface FriendRequestResponse {
  message: string;
}

export interface PendingFriendRequest {
  id: number;
  status: string;
  sender: FriendSearchUser;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:8000/api';
  private pendingRequestsSubject = new BehaviorSubject<PendingFriendRequest[]>([]);
  private friendsSubject = new BehaviorSubject<FriendSearchUser[]>([]);
  private searchResultsSubject = new BehaviorSubject<FriendSearchUser[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();
  public pendingRequests$ = this.pendingRequestsSubject.asObservable();
  public friends$ = this.friendsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getFriends(): Observable<FriendSearchUser[]> {
    // Cargamos la lista de amistades ya aceptadas y la dejamos en memoria compartida.
    return this.http.get<FriendSearchUser[]>(`${this.apiUrl}/friends`).pipe(
      tap((friends) => {
        this.friendsSubject.next(friends);
      })
    );
  }

  deleteFriend(friendId: number): Observable<FriendRequestResponse> {
    return this.http.delete<FriendRequestResponse>(`${this.apiUrl}/friends/${friendId}`);
  }

  searchUsers(query: string): Observable<FriendSearchUser[]> {
    // Esta busqueda consulta por player_id y el backend ya excluye amigos y pendientes.
    return this.http
      .get<FriendSearchUser[]>(`${this.apiUrl}/friends/search`, {
        params: { q: query }
      })
      .pipe(
        tap((users) => {
          this.searchResultsSubject.next(users);
        })
      );
  }

  clearSearchResults(): void {
    this.searchResultsSubject.next([]);
  }

  sendFriendRequest(receiverId: number): Observable<FriendRequestResponse> {
    // Usamos la ruta legacy porque sigue siendo compatible con el backend actual.
    return this.http.post<FriendRequestResponse>(`${this.apiUrl}/friend-requests/send`, {
      receiver_id: receiverId
    });
  }

  getPendingFriendRequests(): Observable<PendingFriendRequest[]> {
    // Guarda en estado local las solicitudes recibidas para badges y refrescos de UI.
    return this.http.get<PendingFriendRequest[]>(`${this.apiUrl}/friend-requests/pending`).pipe(
      tap((requests) => {
        this.pendingRequestsSubject.next(requests);
      })
    );
  }

  acceptFriendRequest(requestId: number): Observable<FriendRequestResponse> {
    // Al aceptar, backend crea la amistad en ambos sentidos.
    return this.http.post<FriendRequestResponse>(`${this.apiUrl}/friend-requests/${requestId}/accept`, {});
  }

  rejectFriendRequest(requestId: number): Observable<FriendRequestResponse> {
    return this.http.post<FriendRequestResponse>(`${this.apiUrl}/friend-requests/${requestId}/reject`, {});
  }
}
