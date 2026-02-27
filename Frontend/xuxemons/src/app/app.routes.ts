import { Routes } from '@angular/router';
import { Login } from './login/login';
import { InfoUsuarioComponent } from './components/info-usuario/info-usuario';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'perfil', component: InfoUsuarioComponent },
];
