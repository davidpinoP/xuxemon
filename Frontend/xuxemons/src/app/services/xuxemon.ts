import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Xuxemon {
  private apiUrl = 'http://127.0.0.1:8000/api/xuxemons';

  constructor(private http: HttpClient) { }

  getXuxemons(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getXuxemonById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createXuxemon(xuxemonData: any): Observable<any> {
    return this.http.post(this.apiUrl, xuxemonData);
  }

  updateXuxemon(id: number, xuxemonData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, xuxemonData);
  }

  deleteXuxemon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // metodos para 0admin: config y vacunas
  getConfigs() { return this.http.get('http://127.0.0.1:8000/api/admin/configs'); }
  saveConfigs(c: any) { return this.http.post('http://127.0.0.1:8000/api/admin/configs', c); }
  getUsers() { return this.http.get('http://127.0.0.1:8000/api/users'); }
  darVacuna(id: number, n: string) { return this.http.post(`http://127.0.0.1:8000/api/admin/users/${id}/vaccine`, { nombre: n }); }

  // recompensas
  checkRewards() { return this.http.get('http://127.0.0.1:8000/api/user/check-rewards'); }
  claimReward() { return this.http.post('http://127.0.0.1:8000/api/user/claim-reward', {}); }
}

