import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { Router } from '@angular/router';
import { IonItemSliding, AlertController } from '@ionic/angular';
import { Subscription, of, BehaviorSubject } from 'rxjs';
import { delay, take, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit, OnDestroy {
  
  offers: Place[] = [];

  isLoading = false;

  private offersSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.offersSub = this.authService.userId.pipe(take(1), switchMap(userId => {
      return this.placesService.fetchPlacesByUserId(userId);
    })
    ).subscribe(() => {
      this.placesService.places.subscribe(places => {
        this.offers = places;
        this.isLoading = false;
      });
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    slidingItem.close();
  }

  onDelete(offerId: number, slidingItem: IonItemSliding) {
    this.alertCtrl
      .create({
        header: 'Are you sure?',
        message: 'You really wanna delete this offer?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.placesService.deletePlace(offerId).subscribe(() => {
                slidingItem.close();
              });
            }
          }
        ]
      })
      .then(delAlert => delAlert.present());
    slidingItem.close();
  }

  ngOnDestroy() {
    if (this.offersSub) {
      this.offersSub.unsubscribe();
    }
  }
}
