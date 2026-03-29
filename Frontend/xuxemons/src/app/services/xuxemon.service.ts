import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, timeout, tap } from 'rxjs'; // Añadimos BehaviorSubject y tap
import { IXuxemon } from '../models/xuxemon.interface';

@Injectable({
    providedIn: 'root'
})
export class XuxemonService {
    private apiUrl = 'http://localhost:8000/api';

    // El Subject guarda el estado actual de los Xuxemons
    private xuxemonsSubject = new BehaviorSubject<IXuxemon[]>([]);
    
    // Este es el Observable al que se suscribirán tus componentes
    public xuxemons$: Observable<IXuxemon[]> = this.xuxemonsSubject.asObservable();

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    // Modificamos getXuxemons para que actualice el Subject automáticamente
    getXuxemons(): Observable<IXuxemon[]> {
        return this.http.get<IXuxemon[]>(`${this.apiUrl}/xuxemons`, {
            headers: this.getHeaders()
        }).pipe(
            timeout(3000),
            // El 'tap' hace que, cuando lleguen los datos, se avise a toda la app
            tap(xuxemons => {
                this.xuxemonsSubject.next(xuxemons);
            })
        );
    }

    // Método para obtener el valor actual sin hacer peticiones HTTP
    getXuxemonsSnapshot(): IXuxemon[] {
        return this.xuxemonsSubject.value;
    }

    getMisXuxemons(): Observable<IXuxemon[]> {
        return this.http.get<IXuxemon[]>(`${this.apiUrl}/user/xuxemons`, {
            headers: this.getHeaders()
        });
    }

    alimentarXuxemon(id: number, xuxe: string, cantidad: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/xuxemons/${id}/alimentar`, {
            xuxe,
            cantidad
        }, {
            headers: this.getHeaders()
        });
    }

    getXuxemonPorId(id: number): Observable<IXuxemon> {
        return this.http.get<IXuxemon>(`${this.apiUrl}/xuxemons/${id}`, {
            headers: this.getHeaders()
        });
    }

    darXuxemonAleatorio(userId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/admin/dar-xuxemon-aleatorio`, { user_id: userId }, {
            headers: this.getHeaders()
        });
    }
}
