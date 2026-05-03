import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Xuxemon } from './services/xuxemon';
import { GameConfigService } from './services/game-config.service';
import { LoadingService } from './services/loading.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoadingSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'xuxemons';
  showReward = false;
  readonly loading$;

  constructor(
    private xuxemonService: Xuxemon,
    private gameConfigService: GameConfigService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.gameConfigService.load().subscribe();
    this.comprobarRecompensaDiaria();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.comprobarRecompensaDiaria());
  }

  claim() {
    this.xuxemonService.claimReward().subscribe({
      next: (response: any) => {
        this.showReward = false;
        const amount = response?.reward?.xuxes ?? this.rewardXuxesAmount;
        alert(`recompensa recibida: ${amount} xuxes + 1 xuxemon pequeno.`);
      },
      error: (err) => {
        alert(err?.error?.message || 'No puedes reclamar la recompensa en este momento.');
      }
    });
  }

  get rewardXuxesAmount(): number {
    return this.gameConfigService.snapshot.reward_xuxes_amount;
  }

  private comprobarRecompensaDiaria(): void {
    const token = this.authService.getToken();
    const rutaActual = this.router.url;

    if (!token || rutaActual === '/login' || rutaActual === '/register') {
      this.showReward = false;
      return;
    }

    this.xuxemonService.checkRewards().subscribe({
      next: (res: any) => {
        this.showReward = !!res.can_claim;
      },
      error: () => {
        this.showReward = false;
      }
    });
  }
}
