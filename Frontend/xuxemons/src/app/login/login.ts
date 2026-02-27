import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {


  formulariLogin = new FormGroup({

    player_id: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  Submit() {
    console.log(this.formulariLogin.value);
  }
}
