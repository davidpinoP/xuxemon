import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class XuxemonService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    // Obtener todos los xuxemons del catalogo
    getXuxemons(): Observable<any> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get(`${this.apiUrl}/xuxemons`, { headers });
    }
}
