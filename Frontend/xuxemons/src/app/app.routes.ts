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
    { path: 'register', component: Registro, title: 'Registrarse - Xuxemons' },
    { path: 'home', component: Home, canActivate: [authGuard], title: 'Inicio - Xuxemons' },
    { path: 'xuxedex', component: Xuxedex, canActivate: [authGuard], title: 'Xuxedex - Catalogo' },
    { path: 'inventory', component: Mochila, canActivate: [authGuard], title: 'Mochila - Inventario' },
    { path: 'friends', component: FriendsBasic, canActivate: [authGuard], title: 'Amigos' },
    { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'Perfil' },
    {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [adminGuard],
        title: 'Administración'
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
];