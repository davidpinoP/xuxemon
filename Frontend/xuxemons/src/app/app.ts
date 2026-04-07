import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Xuxemon } from './services/xuxemon';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'xuxemons';
  showReward = false;
  currentRoute = '';

  constructor(
    private xuxemonService: Xuxemon,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
      });

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

  get isFriendsRoute(): boolean {
    return this.currentRoute === '/friends';
  }
}

