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

    feedXuxemon(id: number, xuxe: string, cantidad: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/xuxemons/${id}/feed`, { xuxe, cantidad }, {
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

    createXuxemon(xuxemonData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/xuxemons`, xuxemonData, {
            headers: this.getHeaders()
        });
    }

    updateXuxemon(id: number, xuxemonData: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/xuxemons/${id}`, xuxemonData, {
            headers: this.getHeaders()
        });
    }

    deleteXuxemon(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/xuxemons/${id}`, {
            headers: this.getHeaders()
        });
    }

    getConfigs(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin/configs`, {
            headers: this.getHeaders()
        });
    }

    saveConfigs(c: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/admin/configs`, c, {
            headers: this.getHeaders()
        });
    }

    darVacuna(id: number, n: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/admin/users/${id}/vaccine`, { nombre: n }, {
            headers: this.getHeaders()
        });
    }

    checkRewards(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/check-rewards`, {
            headers: this.getHeaders()
        });
    }

    claimReward(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/user/claim-reward`, {}, {
            headers: this.getHeaders()
        });
    }
}