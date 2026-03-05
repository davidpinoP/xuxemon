import { Component, OnInit } from '@angular/core';
import { XuxemonService } from '../services/xuxemon.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-xuxedex',
  imports: [],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css',
})
export class Xuxedex implements OnInit {
  xuxemons: any[] = [];
  cargando: boolean = true;

  constructor(private xuxemonService: XuxemonService, private router: Router) { }

  ngOnInit(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data) => {
        this.xuxemons = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los xuxemons', err);
        this.cargando = false;
      }
    });
  }

  volverHome() {
    this.router.navigate(['/home']);
  }
}
