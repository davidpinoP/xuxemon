import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { Xuxedex } from './xuxedex/xuxedex';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: 'home', component: Home },
    { path: 'xuxedex', component: Xuxedex },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
