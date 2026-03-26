import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Xuxemon } from './services/xuxemon';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'xuxemons';
  showReward = false;

  constructor(private xuxemonService: Xuxemon) { }

  ngOnInit() {
    // comprobar si hay recompensa al entrar
    this.xuxemonService.checkRewards().subscribe((res: any) => {
      if (res.can_claim) {
        this.showReward = true;
      }
    });
  }

  claim() {
    this.xuxemonService.claimReward().subscribe(() => {
      this.showReward = false;
      alert('recompensa recibida: 5 xuxes!');
    });
  }
}

