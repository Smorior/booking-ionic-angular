import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Base64 } from 'js-base64';
import { switchMap, map, tap, take } from 'rxjs/operators';
import { BehaviorSubject, from, of } from 'rxjs';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';

interface RegisterUser {
  userId: number;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {


  private _user = new BehaviorSubject<User>(null);

  private activeLogoutTimer: any;


  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
      return !!user.token;
      } else {
        return false;
      }
    }));
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.userId;
      } else {
        return null;
      }
    }));
  }


  signUp(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) {
    const newUser: RegisterUser = {
      userId: Math.random(),
      email,
      firstName,
      lastName,
      username,
      password
    };
    return this.http
      .post<RegisterUser>(environment.apacheLocation + '/user', {
        ...newUser,
        userId: null
      })
      .pipe(
        take(1),
        switchMap(resp => {
          if (resp.userId != null) {
          return this.login(username, password);
          }
          return;
        })
      );
  }

  login(username: string, password: string) {

    const credentialString: string = 'Basic ' + btoa(username + ':' + password);

    return this.http
      .get<User>(
        environment.apacheLocation +
          '/api/authenticate', {headers: {'Authorization': credentialString}, observe: 'response'}
      )
      .pipe(
        tap(resp => {
          const user: User = resp.body;
          const respHeader: string = resp.headers.get('Authorization');
          user.token = respHeader.replace('Bearer ', '');
          this._user.next(user);
          this.storeAuthData(user);
          this.autoLogout(user.tokenExpiration);
        })
      );
  }

    storeAuthData(user: User) {
    const data = JSON.stringify({user});
    Plugins.Storage.set({key: 'authData', value: data});
  }

  getStoredData() {
    return from(Plugins.Storage.get({key: 'authData'})).pipe(map(data => {
      if (!data || !data.value) {
        return null;
      }
      const parsedData = JSON.parse(data.value) as { user: User };
      return parsedData;
    }), tap(user => {
      if (user) {
      this._user.next(user.user);
      }
    }));
  }

  autoLogin() {
      return this.getStoredData().pipe(take(1), map(data => {
      if (data && data.user.tokenExpiration > new Date().getTime()) {
        this.autoLogout(data.user.tokenExpiration - new Date().getTime());
        return true;
      }
      return false;
    }));
  }

  autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logOut();
    }, duration);
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  logOut() {
    this._user.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }


  constructor(private http: HttpClient) {}
}
