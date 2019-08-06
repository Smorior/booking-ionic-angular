import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  authModeLogin = false;

  constructor(
    private authenticationService: AuthService,
    private router: Router,
    private loadingCtr: LoadingController,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  onLogin(form: NgForm) {
    this.loadingCtr
      .create({
        keyboardClose: true,
        message: 'Logging in...'
      })
      .then(loadingEl => {
        loadingEl.present();
        const username = form.value.username;
        const password = form.value.password;
        this.authenticationService.login(username, password).subscribe(resp => {
          loadingEl.dismiss();
          this.router.navigateByUrl('places/tabs/discover');
          form.reset();
        }, err => {
          this.alertCtrl.create({
            header: 'Info',
            message: 'Bad credentials! Try again.',
            buttons: [{
              text: 'Ok'
            }]
          }).then(alert => {
            loadingEl.dismiss();
            alert.present();
          });
        });
      });
  }

  onSignUp(form: NgForm) {
    const firstName = form.value.firstName;
    const lastName = form.value.lastName;
    const username = form.value.username;
    const email = form.value.email;
    const password = form.value.password;
    this.loadingCtr
      .create({
        keyboardClose: true,
        message: 'Creating account...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.authenticationService
          .signUp(
            firstName,
            lastName,
            username,
            email,
            password
          )
          .subscribe(() => {
            form.reset();
            loadingEl.dismiss();
            this.navCtrl.navigateForward('places/tabs/discover');
          }, err => {
            this.alertCtrl.create({
              header: 'Info',
              message: 'User with same username or email already exists. Please try again!',
              buttons: [{
                text: 'Ok'
              }]
            }).then(alert => {
              form.reset();
              loadingEl.dismiss();
              alert.present();
            });
          });
      });
  }

  onToggleLoginMode() {
    this.authModeLogin = !this.authModeLogin;
  }
}
