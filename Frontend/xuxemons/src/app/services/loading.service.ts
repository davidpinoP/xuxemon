import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Contador interno para saber cuantas peticiones siguen abiertas a la vez.
  // Asi evitamos ocultar el spinner si aun queda otra peticion en curso.
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject(false);

  readonly loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.activeRequests += 1;
    if (this.activeRequests === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests -= 1;
    }

    // Solo apagamos el estado global cuando ya no queda ninguna peticion activa.
    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }
}
