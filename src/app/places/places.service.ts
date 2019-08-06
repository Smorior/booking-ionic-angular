import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PlaceLocation } from './location.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http.get<Place[]>(environment.apacheLocation + '/place').pipe(map(resData => {
      const places: Place[] = [];
      return places.concat(resData);
    }), tap(places => {
      this._places.next(places);
    })
    );
  }

  fetchPlacesByUserId(userId: number) {
    return this.http.get<Place[]>(environment.apacheLocation + `/place/user/${userId}`).
    pipe(map(resData => {
      const places: Place[] = [];
      return places.concat(resData);
    }), tap(places => {
      this._places.next(places);
    }));
  }

  deletePlace(placeId: number) {
    return this.places.pipe(
      take(1),
      tap(places => {
        this._places.next(places.filter(p => p.placeId !== placeId));
      }), switchMap(() => {
        return this.http.delete(environment.apacheLocation + `/place/${placeId}`);
      })
    );
  }

  updatePlace(
    placeId: number,
    title: string,
    description: string,
    price: number,
    location: PlaceLocation
  ) {
    let newPlace: Place;
    let newPlaces: Place[];
    return this.places.pipe(
      take(1), switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        places.map(p => {
          if (p.placeId === placeId) {
            p.title = title;
            p.description = description;
            p.price = price;
            p.location = location;
            newPlace = p;
          }
        });
        newPlaces = places;
        return this.http.patch(environment.apacheLocation + `/place/${placeId}`, {...newPlace, placeId: null});
      }),
      tap(() => {
        this._places.next(newPlaces);
      })
    );
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  public getPlace(id: number) {
    return this.http.get<Place>(environment.apacheLocation + `/place/${id}`);
  }

  public uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('file', image);
    console.log(uploadData);
    return this.http.post<{fileDownloadUri: string}>(environment.apacheLocation + '/file/upload', uploadData);
  }

  public addPlace(
    title: string,
    description: string,
    price: number,
    availableFrom: Date,
    availableTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let newPlace: Place;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('User not found!');
      }
      const place: Place = new Place(
        Math.random(),
        title,
        description,
        imageUrl,
        price,
        new Date(
          new Date(availableFrom).getFullYear() +
            '-' +
            new Date(availableFrom).getMonth() +
            '-' +
            new Date(availableFrom).getDate()
        ),
        new Date(
          new Date(availableTo).getFullYear() +
            '-' +
            new Date(availableTo).getMonth() +
            '-' +
            new Date(availableTo).getDate()
        ),
        userId,
        location
      );
      return this.http.post<Place>(environment.apacheLocation + '/place', { ...place, placeId: null });
    }), switchMap(respData => {
          newPlace = respData;
          return this.places;
        }),
        take(1),
        tap(places => {
          this._places.next(places.concat(newPlace));
        })
        );
     }
}
