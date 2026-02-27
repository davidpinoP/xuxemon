import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
