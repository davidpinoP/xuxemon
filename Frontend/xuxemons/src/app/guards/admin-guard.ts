import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Este guard evita que un usuario normal navegue al panel admin desde Angular.
// La seguridad real sigue estando en Laravel con middleware de rol.
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const role = localStorage.getItem('userRole'); 

  if (role === 'admin') {
    return true; 
  } else {
    alert(' ¡Acceso denegado! Esta zona es solo para Administradores.');
    router.navigate(['/home']);
    return false;
  }
};
