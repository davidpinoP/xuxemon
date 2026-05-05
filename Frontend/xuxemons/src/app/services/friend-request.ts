import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestService {
  // Ajusta esta URL si tu backend corre en otro puerto
  private apiUrl = 'http://localhost:8000/api/friend-requests'; 

  constructor(private http: HttpClient) { }

  // Servicio dedicado al flujo de solicitudes recibidas/enviadas.
  // Mantiene los nombres legacy del backend para no romper la integracion actual.
  //  Enviar solicitud
  sendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { receiver_id: receiverId });
  }

  //  Obtener la lista de solicitudes pendientes recibidas
  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`);
  }

  //  Aceptar solicitud
  acceptRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${requestId}/accept`, {});
  }

  //  Rechazar solicitud
  rejectRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${requestId}/reject`, {});
  }
}
