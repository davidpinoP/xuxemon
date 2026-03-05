import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Xuxemon {
  private apiUrl = 'http://127.0.0.1:8000/api/xuxemons';

  constructor(private http: HttpClient) {}

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
}