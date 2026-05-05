import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Xuxemon {
  constructor(private http: HttpClient) { }

  // metodos para 0admin: config y vacunas
  getConfigs() { return this.http.get('http://127.0.0.1:8000/api/admin/configs'); }
  saveConfigs(c: any) { return this.http.post('http://127.0.0.1:8000/api/admin/configs', c); }
  getUsers() { return this.http.get('http://127.0.0.1:8000/api/users'); }
  darVacuna(userId: number, nombre: string) {
    return this.http.post('http://127.0.0.1:8000/api/admin/dar-vacuna', {
      user_id: userId,
      nombre: nombre
    });
  }

  darXuxes(userId: number, nombre: string, cantidad: number) {
    return this.http.post('http://127.0.0.1:8000/api/admin/dar-chuches', {
      user_id: userId,
      nombre,
      cantidad
    });
  }

  darXuxemonAleatorio(userId: string | number) {
    return this.http.post('http://127.0.0.1:8000/api/admin/dar-xuxemon-aleatorio', {
      user_id: userId
    });
  }

  // Recompensa diaria:
  // - checkRewards solo pregunta si toca ensenar el popup
  // - claimReward reclama de verdad la recompensa y devuelve el detalle entregado
  checkRewards() { return this.http.get('http://127.0.0.1:8000/api/user/check-rewards'); }
  claimReward() { return this.http.post('http://127.0.0.1:8000/api/user/claim-reward', {}); }
}
