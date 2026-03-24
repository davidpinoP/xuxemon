import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Xuxemon } from '../services/xuxemon';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {

  xuxemons: any[] = [];
  xuxemonForm: FormGroup;
  isEditing: boolean = false;
  currentId: number | null = null;
  // nuevas propiedades simples
  fConfig: FormGroup;
  users: any[] = [];


  constructor(
    private fb: FormBuilder,
    private xuxemonService: Xuxemon
  ) {
    this.xuxemonForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      descripcion: [''],
      tamano: ['', Validators.required]
    });
    // form de configuracion
    this.fConfig = this.fb.group({
      infection_pct: [0],
      evolve_xuxes: [0],
      reward_hour: [0]
    });
  }


  ngOnInit(): void {
    this.cargarXuxemons();
    // cargar todo al inicio
    this.xuxemonService.getConfigs().subscribe((d: any) => this.fConfig.patchValue(d));
    this.xuxemonService.getUsers().subscribe((d: any) => this.users = d);
  }



  cargarXuxemons(): void {
    this.xuxemonService.getXuxemons().subscribe({
      next: (data: any) => this.xuxemons = data,
      error: (err: any) => console.error('Error al cargar Xuxemons', err)
    });
  }

  guardarXuxemon(): void {
    if (this.xuxemonForm.invalid) return;
    if (this.isEditing && this.currentId) {
      this.xuxemonService.updateXuxemon(this.currentId, this.xuxemonForm.value).subscribe({
        next: () => {
          alert('¡Xuxemon actualizado correctamente!');
          this.resetForm();
          this.cargarXuxemons();
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.xuxemonService.createXuxemon(this.xuxemonForm.value).subscribe({
        next: () => {
          alert('¡Nuevo Xuxemon creado!');
          this.resetForm();
          this.cargarXuxemons();
        },
        error: () => alert('Error al crear')
      });
    }
  }

  editarXuxemon(xuxe: any): void {
    this.isEditing = true;
    this.currentId = xuxe.id;
    this.xuxemonForm.patchValue({
      nombre: xuxe.nombre,
      tipo: xuxe.tipo,
      descripcion: xuxe.descripcion
    });
  }

  borrarXuxemon(id: number): void {
    if (confirm(' ¿Estás totalmente seguro de que quieres borrar este Xuxemon?')) {
      this.xuxemonService.deleteXuxemon(id).subscribe({
        next: () => {
          alert('Xuxemon eliminado');
          this.cargarXuxemons();
        },
        error: () => alert('Error al borrar')
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.xuxemonForm.reset();
  }

  // guardar configs
  saveConf() {
    this.xuxemonService.saveConfigs(this.fConfig.value).subscribe(() => alert('guardado'));
  }

  // dar vacuna
  vacuna(id: number, n: string) {
    this.xuxemonService.darVacuna(id, n).subscribe(() => alert('vacuna enviada'));
  }
}
