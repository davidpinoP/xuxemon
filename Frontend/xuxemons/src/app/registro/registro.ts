import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {


  FormularioRegistro = new FormGroup({

    nombre: new FormControl('', [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required], [Validators.email]),
    contraseña: new FormControl('', [Validators.required]),
    confirmar_contraseña: new FormControl('', [Validators.required]),

  });

}
