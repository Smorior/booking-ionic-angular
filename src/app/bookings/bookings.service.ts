import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchBookings() {
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      return this.http.get<Booking[]>(environment.apacheLocation + `/booking/user/${userId}`);
    }), take(1),
      tap(booking => {
        this._bookings.next(booking);
      })
    );
  }
  addBooking(
    placeId: number,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let booking: Booking;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
      if (!userId) {
        return;
      }
      booking = new Booking(
        Math.random(),
        placeId,
        userId,
        placeTitle,
        placeImage,
        firstName,
        lastName,
        guestNumber,
        dateFrom,
        dateTo
      );
      return this.http
      .post<Booking>(environment.apacheLocation + '/booking', { ...booking, bookingId: null });
      }),
      switchMap(respData => {
          newBooking = respData;
          return this.bookings;
        }), take(1),
        tap(bookings => {
          this._bookings.next(bookings.concat(newBooking));
        })
      );
    }

  public cancelBooking(bookingId: number) {
    return this.http.delete(environment.apacheLocation + `/booking/${bookingId}`).pipe(switchMap(() => {
      return this.bookings.pipe(
        take(1),
        tap(bookings => {
          this._bookings.next(
            bookings.filter(booking => booking.bookingId !== bookingId)
          );
        })
      );
    }));
  }

  constructor(private authService: AuthService, private http: HttpClient) {}
}
