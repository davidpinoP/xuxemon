import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
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
    }

    savePlayerId(playerId: string): void {
        localStorage.setItem('player_id', playerId);
    }
}
