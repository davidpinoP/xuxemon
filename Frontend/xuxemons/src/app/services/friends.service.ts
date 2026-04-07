import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface FriendSearchUser {
  id: number;
  name: string;
  surname: string;
  player_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:8000/api';
  private searchResultsSubject = new BehaviorSubject<FriendSearchUser[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) {}

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
}
