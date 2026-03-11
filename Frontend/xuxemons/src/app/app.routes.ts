import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Home } from './home/home';
import { Xuxedex } from './xuxedex/xuxedex';
import { Perfil } from './perfil/perfil';
import { authGuard } from './guards/auth.guard';

import { AdminPanelComponent } from './admin-panel/admin-panel'; 
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Registro },
    { path: 'home', component: Home },
    { path: 'xuxedex', component: Xuxedex },
    { 
        path: 'admin', 
        component: AdminPanelComponent, 
        canActivate: [adminGuard] 
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
