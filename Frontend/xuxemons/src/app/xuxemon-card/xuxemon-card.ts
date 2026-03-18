import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IXuxemon } from '../models/xuxemon.interface'; 
@Component({
  selector: 'app-xuxemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xuxemon-card.html',
  styleUrl: './xuxemon-card.css' 
})
export class XuxemonCardComponent {
  

  @Input() xuxemon!: IXuxemon;

  get tipoIcono(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return '?';
    switch (this.xuxemon.tipo.toLowerCase()) {
      case 'agua': return '💧';
      case 'tierra': return '🪨';
      case 'aire': return '💨';
      default: return '⚪';
    }
  }

  get tipoNombre(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'Desconocido';
    const tipo = this.xuxemon.tipo;
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  get tipoClase(): string {
    if (!this.xuxemon || !this.xuxemon.tipo) return 'tipo-desconocido';
    return 'tipo-' + this.xuxemon.tipo.toLowerCase();
  }

  getStatValue(stat: string): number {
    if (!this.xuxemon) return 50;
    const semilla = this.xuxemon.id * 31;
    switch (stat) {
      case 'vida': return 40 + (semilla % 61);
      case 'ataque': return 30 + ((semilla * 7) % 71);
      case 'defensa': return 35 + ((semilla * 13) % 66);
      case 'velocidad': return 25 + ((semilla * 19) % 76);
      default: return 50;
    }
  }
}