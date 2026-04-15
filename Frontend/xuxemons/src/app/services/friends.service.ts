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
  public searchResults$ = this.searchResultsSubject.asObservable();
  public pendingRequests$ = this.pendingRequestsSubject.asObservable();
  public friends$ = this.friendsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getFriends(): Observable<FriendSearchUser[]> {
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
    return this.http.post<FriendRequestResponse>(`${this.apiUrl}/friend-requests`, {
      receiver_id: receiverId
    });
  }

  getPendingFriendRequests(): Observable<PendingFriendRequest[]> {
    return this.http.get<PendingFriendRequest[]>(`${this.apiUrl}/friend-requests`).pipe(
      tap((requests) => {
        this.pendingRequestsSubject.next(requests);
      })
    );
  }

  acceptFriendRequest(requestId: number): Observable<FriendRequestResponse> {
    return this.http.put<FriendRequestResponse>(`${this.apiUrl}/friend-requests/${requestId}/accept`, {});
  }

  rejectFriendRequest(requestId: number): Observable<FriendRequestResponse> {
    return this.http.delete<FriendRequestResponse>(`${this.apiUrl}/friend-requests/${requestId}`);
  }
}
