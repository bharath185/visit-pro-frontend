import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding auth header for public endpoints and login
    const url = req.url.toLowerCase();
    if (url.includes('/api/public/') || url.includes('/api/auth/login') ||
        url.includes('/api/auth/forgot-password') || url.includes('/api/auth/reset-password') ||
        url.includes('/api/auth/register')) {
      return next.handle(req);
    }

    // Attach JWT token from localStorage
    const token = localStorage.getItem('visitor_token');
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      return next.handle(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 403) {
            // Token invalid or expired - redirect to login
            localStorage.removeItem('visitor_user');
            localStorage.removeItem('visitor_token');
            this.router.navigate(['/']);
          }
          return throwError(() => err);
        })
      );
    }

    return next.handle(req);
  }
}
