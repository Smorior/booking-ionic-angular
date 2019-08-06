import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';
import {
  IonSlide,
  IonItemSliding,
  AlertController,
  LoadingController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss']
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  bookingSub: Subscription;
  isLoading = false;

  constructor(
    private bookingsService: BookingsService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.bookingSub = this.bookingsService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
      this.isLoading = false;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }

 
  onDelete(bookingId: number, slideingItem: IonItemSliding) {
    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'You really want to cancel booking?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      },
    {
      text: 'Delete',
      handler: () => {
        this.loadingCtrl.create({
          message: 'Canceling...',
          spinner: 'bubbles'
        }).then(loadingEl => {
          loadingEl.present();
          this.zone.run(() => {
            this.bookingsService.cancelBooking(bookingId).subscribe(() => {
              slideingItem.close();
              loadingEl.dismiss();
            });
          });
        });
      }
    }]
    }).then(alert => alert.present());
    slideingItem.close();
  }


  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
