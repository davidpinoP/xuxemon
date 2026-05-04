import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8000/api';

    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                // Guardamos el usuario en memoria para que otros componentes reaccionen al login.
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
        const token = this.getToken();

        if (!token) {
            this.clearSession();
            return;
        }

        this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
            next: () => this.clearSession(),
            error: () => this.clearSession()
        });
    }

    savePlayerId(playerId: string): void {
        localStorage.setItem('player_id', playerId);
    }
    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/profile`).pipe(
            tap((user: any) => {
                this.currentUserSubject.next(user);
            }),
            catchError(err => {
                // Si falla el perfil (token expirat o invàlid), netegem
                if (err.status === 401) {
                    this.logout();
                }
                return throwError(() => err);
            })
        );
    }

    autoLogin(): Promise<void> {
        const token = this.getToken();
        if (!token) {
            return Promise.resolve();
        }

        // Si ya habia token guardado, intentamos reconstruir la sesion pidiendo el perfil.
        return new Promise((resolve) => {
            this.getProfile().subscribe({
                next: () => resolve(),
                error: () => {
                    this.logout();
                    resolve();
                }
            });
        });
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

    restoreUser(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/restore`, {});
    }

    deactivateUser(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/deactivate`, {});
    }

    updateUserInventory(userId: number, inventory: any[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}/inventory`, { inventory });
    }

    getAmigos(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/amigos`);
    }

    eliminarAmigo(amigoId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/amigos/${amigoId}`);
    }

    private clearSession(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('player_id');
        // Al cerrar sesion, tambien vaciamos el usuario compartido en memoria.
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
