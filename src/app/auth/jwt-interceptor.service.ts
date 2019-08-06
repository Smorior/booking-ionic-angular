import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {
  intercept(
    req: import('@angular/common/http').HttpRequest<any>,
    next: import('@angular/common/http').HttpHandler
  ): import('rxjs').Observable<import('@angular/common/http').HttpEvent<any>> {

    
    return this.authService.getStoredData().pipe(
      switchMap(data => {
        let newHeaders = req.headers;
        if (!req.url.includes(environment.apacheLocation +
          '/api/authenticate') && data !== null ) {
            newHeaders = newHeaders.append('Authorization', `Bearer ${data.user.token}`);
        }
        const authReq = req.clone({ headers: newHeaders });
        return next.handle(authReq);
      })
    );
  }

  constructor(private authService: AuthService) {}
}
