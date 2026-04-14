import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Xuxemon } from './services/xuxemon';
import { GameConfigService } from './services/game-config.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'xuxemons';
  showReward = false;

  constructor(
    private xuxemonService: Xuxemon,
    private gameConfigService: GameConfigService
  ) { }

  ngOnInit() {
    this.gameConfigService.load().subscribe();

    // comprobar si hay recompensa al entrar
    this.xuxemonService.checkRewards().subscribe((res: any) => {
      if (res.can_claim) {
        this.showReward = true;
      }
    });
  }

  claim() {
    this.xuxemonService.claimReward().subscribe({
      next: () => {
        this.showReward = false;
        alert('recompensa recibida: 10 xuxes + 1 xuxemon pequeño.');
      },
      error: (err) => {
        alert(err?.error?.message || 'No puedes reclamar la recompensa en este momento.');
      }
    });
  }
}
