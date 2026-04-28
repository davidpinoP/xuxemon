import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoadingService } from './loading.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const loadingService = inject(LoadingService);
    const token = authService.getToken();
    const shouldTrackLoading = !req.url.includes('/assets/') && !req.url.includes('/imagenes/');

    if (shouldTrackLoading) {
        loadingService.show();
    }

    const requestToSend = token
        ? req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })
        : req;

    return next(requestToSend).pipe(
        catchError((error) => {
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/login']);
            }

            return throwError(() => error);
        }),
        finalize(() => {
            if (shouldTrackLoading) {
                loadingService.hide();
            }
        })
    );
};
