import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  isAdmin = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Guardamos una copia simple del rol para decidir si se muestra el acceso
    // al panel admin en el menu lateral.
    this.isAdmin = localStorage.getItem('userRole') === 'admin';
  }

  logout(): void {
    // Cierra sesion en backend/frontend y devuelve al usuario a login.
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
