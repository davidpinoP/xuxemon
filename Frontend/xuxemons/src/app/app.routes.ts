import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
