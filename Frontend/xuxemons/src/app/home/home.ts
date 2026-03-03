import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: any = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Obtenemos los datos del perfil si el login ha sido correcto
    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
