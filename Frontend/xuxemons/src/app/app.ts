import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Xuxemon } from './services/xuxemon';
import { GameConfigService } from './services/game-config.service';
import { LoadingService } from './services/loading.service';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner';

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
    private loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    this.gameConfigService.load().subscribe();

    this.xuxemonService.checkRewards().subscribe((res: any) => {
      if (res.can_claim) {
        this.showReward = true;
      }
    });
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
}
