import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8000/api';

    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res && res.user) {
                    this.currentUserSubject.next(res.user);
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    saveToken(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userRole'); // Netegem el rol al sortir
        this.currentUserSubject.next(null);
    }

    savePlayerId(playerId: string): void {
        localStorage.setItem('player_id', playerId);
    }
    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/profile`).pipe(
            tap((user: any) => {
                this.currentUserSubject.next(user);
            })
        );
    }

    updateProfile(userData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/user/update`, userData);
    }

    deactivateAccount(): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/deactivate`, {});
    }

    me(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`);
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    updateUserInventory(userId: number, inventory: any[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/inventory`, { inventory });
    }
}
