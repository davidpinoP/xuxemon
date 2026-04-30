import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { Xuxedex } from './xuxedex/xuxedex';
import { Perfil } from './perfil/perfil';
import { authGuard } from './guards/auth.guard';
import { Mochila } from './mochila/mochila';
import { FriendsBasic } from './friends-basic/friends-basic';
import { AdminPanelComponent } from './admin-panel/admin-panel';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Entrar - Xuxemons' },
  { path: 'register', component: Registro, title: 'Registro - Xuxemons' },
  { path: 'home', component: Home, canActivate: [authGuard], title: 'Inicio - Xuxemons' },
  { path: 'xuxedex', component: Xuxedex, canActivate: [authGuard], title: 'Xuxedex - Xuxemons' },
  { path: 'inventory', component: Mochila, canActivate: [authGuard], title: 'Mochila - Xuxemons' },
  { path: 'friends', component: FriendsBasic, canActivate: [authGuard], title: 'Amigos - Xuxemons' },
  { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'Perfil - Xuxemons' },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [adminGuard],
    title: 'Panel Admin - Xuxemons'
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
