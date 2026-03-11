import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const role = localStorage.getItem('userRole'); 

  if (role === 'admin') {
    return true; 
  } else {
    alert(' ¡Acceso denegado! Esta zona es solo para Administradores.');
    router.navigate(['/inicio']);
    return false;
  }
};