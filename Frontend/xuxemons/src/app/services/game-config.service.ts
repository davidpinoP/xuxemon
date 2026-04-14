import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface GameConfig {
  infection_pct: number;
  evolve_xuxes: number;
  reward_hour: number;
}

const DEFAULT_GAME_CONFIG: GameConfig = {
  infection_pct: 0,
  evolve_xuxes: 3,
  reward_hour: 8
};

@Injectable({
  providedIn: 'root'
})
export class GameConfigService {
  private apiUrl = 'http://localhost:8000/api/configs';
  private configSubject = new BehaviorSubject<GameConfig>(DEFAULT_GAME_CONFIG);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<GameConfig> {
    return this.http.get<Partial<GameConfig>>(this.apiUrl).pipe(
      map((data) => this.normalize(data)),
      tap((cfg) => this.configSubject.next(cfg)),
      catchError(() => {
        this.configSubject.next(DEFAULT_GAME_CONFIG);
        return of(DEFAULT_GAME_CONFIG);
      })
    );
  }

  get snapshot(): GameConfig {
    return this.configSubject.value;
  }

  private normalize(data: Partial<GameConfig> | null | undefined): GameConfig {
    const safe = data || {};
    const infection = this.toNumber(safe.infection_pct, DEFAULT_GAME_CONFIG.infection_pct);
    const evolve = this.toNumber(safe.evolve_xuxes, DEFAULT_GAME_CONFIG.evolve_xuxes);
    const reward = this.toNumber(safe.reward_hour, DEFAULT_GAME_CONFIG.reward_hour);

    return {
      infection_pct: Math.max(0, Math.min(100, infection)),
      evolve_xuxes: evolve > 0 ? evolve : DEFAULT_GAME_CONFIG.evolve_xuxes,
      reward_hour: Math.max(0, Math.min(23, reward))
    };
  }

  private toNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
