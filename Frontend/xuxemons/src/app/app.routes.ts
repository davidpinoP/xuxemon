import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { Xuxedex } from './xuxedex/xuxedex';
import { Perfil } from './perfil/perfil';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'xuxedex', component: Xuxedex, canActivate: [authGuard] },
    { path: 'perfil', component: Perfil, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];

