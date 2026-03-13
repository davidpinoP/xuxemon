import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { IXuxemon } from '../models/xuxemon.interface';

@Injectable({
    providedIn: 'root'
})
export class XuxemonService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    // Cabeceras con token de autenticacion
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // Obtener todos los xuxemons del catalogo (timeout de 3s si el backend no responde)
    getXuxemons(): Observable<IXuxemon[]> {
        return this.http.get<IXuxemon[]>(`${this.apiUrl}/xuxemons`, {
            headers: this.getHeaders()
        }).pipe(timeout(3000));
    }

    // Obtener un xuxemon por su id
    getXuxemonPorId(id: number): Observable<IXuxemon> {
        return this.http.get<IXuxemon>(`${this.apiUrl}/xuxemons/${id}`, {
            headers: this.getHeaders()
        });
    }
}
