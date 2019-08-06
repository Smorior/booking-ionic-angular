import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router) {}

  canLoad(route: import('@angular/router')
.Route,   segments: import('@angular/router')
.UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
  return this.authService.userIsAuthenticated.pipe(take(1),
  switchMap(resp => {
     return this.authService.autoLogin().pipe(take(1), tap(isAutoLogin => {
      if (!resp && isAutoLogin) {
        return true;
      }
      return false;
    }));
    }), tap(isAuth => {
    if (!isAuth) {
      this.router.navigateByUrl('/auth');
    }
  }));
  }
}
