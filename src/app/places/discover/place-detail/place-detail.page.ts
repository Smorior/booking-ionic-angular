import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../places.service';
import { Subscription } from 'rxjs';
import { BookingsService } from 'src/app/bookings/bookings.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';
import { take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  loadedPlace: Place;
  private placeSub: Subscription;
  isBookable = false;
  isLoading = false;

  onBookPlace() {
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetController
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Choose a date',
            handler: () => {
              this.openBookingModal('select');
            }
          },
          {
            text: 'Pick a random date',
            handler: () => {
              this.openBookingModal('random');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      })
      .then(el => {
        el.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    let loadingEl: HTMLIonLoadingElement;
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: {
          loadedPlace: this.loadedPlace,
          selectedMode: mode
        }
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      }).then(resultData => {
        if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          message: 'Creating your booking...'
        }).then(loadingElement => {
          loadingEl = loadingElement;
          loadingEl.present();
          this.bookingService.addBooking(
            this.loadedPlace.placeId,
            this.loadedPlace.title,
            this.loadedPlace.imageUrl,
            resultData.data.bookingData.firstName,
            resultData.data.bookingData.lastName,
            resultData.data.bookingData.guestNumber,
            resultData.data.bookingData.startDate,
            resultData.data.bookingData.endDate,
          ).subscribe(() => {
            loadingEl.dismiss();
            this.router.navigateByUrl('/bookings');
          });
        });
      }});
  }

  constructor(
    private actRoute: ActivatedRoute,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private placesService: PlacesService,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingsService,
    private router: Router,
    private authService: AuthService,
    private altertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.actRoute.paramMap.subscribe(param => {
      if (!param.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
      }
      this.isLoading = true;
      let fetchedUserId: number;
      this.authService.userId.pipe(take(1), switchMap(userId => {
        fetchedUserId = userId;
        return this.placesService.getPlace(+param.get('placeId'));
      })).subscribe(place => {
          this.loadedPlace = place;
          this.isBookable = place.userId !== +fetchedUserId;
          this.isLoading = false;
        }, error => {
          this.altertCtrl.create({
            header: 'An error ocurred',
            message: 'Could not load the place!',
            buttons: [{
              text: 'Ok',
              handler: () => {
                this.navCtrl.navigateBack('/places/tabs/discover');
              }
            }]
          }).then(alert => {
            alert.present();
          });
        }
        );
    });
  }

  showFullMap() {
    console.log(this.loadedPlace.location);
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {lat: this.loadedPlace.location.latitude, lng: this.loadedPlace.location.longitude},
      title: 'View place location',
      selectable: false,
      closeButtonText: 'Close'
    }
    }).then(mapModal => {
      mapModal.present();
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
