import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {
  ModalController,
  ActionSheetController,
  AlertController
} from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';

import { PlaceLocation, Coordinates } from '../../../places/location.model';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  @Input() selectedLocationImg: string;
  @Input() loadedPlace: Place;
  @Input() showPreview = false;

  isLoading = false;
  placeLocation: PlaceLocation;
  autoLocation = false;
  autoLocationCoords: Coordinates;

  @Output() locationPick = new EventEmitter<PlaceLocation>();

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: 'Please choose',
        buttons: [
          { text: 'Auto locate', handler: () => {
            this.autoLocation = true;
            this.autoLocate();
          } },
          {
            text: 'Pick on map',
            handler: () => {
              this.openMap();
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      })
      .then(actionEl => {
        actionEl.present();
      });
  }

  private autoLocate() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.autoLocation = false;
      this.errorAlert();
      return;
    }
    Plugins.Geolocation.getCurrentPosition()
      .then(geoLocation => {
        const coords: Coordinates = {
          latitude: geoLocation.coords.latitude,
          longitude: geoLocation.coords.longitude
        };
        this.autoLocationCoords = coords;
        this.openMap();
      })
      .catch(err => {
        this.autoLocation = false;
        this.errorAlert();
      });
  }

  private errorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to set location!',
        buttons: ['Ok']
      })
      .then(alert => {
        alert.present();
      });
  }

  private openMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.selectedLocation().latitude,
            lng: this.selectedLocation().longitude
          }
        }
      })
      .then(modalEl => {
        modalEl.onDidDismiss().then(modalData => {
          if (!modalData) {
            return;
          }
          console.log(modalData);
          if (!this.autoLocation) {
          this.placeLocation = {
            latitude: modalData.data.lat,
            longitude: modalData.data.lng,
            address: null,
            mapImg: null
          };
        }
          this.autoLocation = false;
          this.isLoading = true;
          return of(
            this.getMapImage(
              this.placeLocation.latitude,
              this.placeLocation.longitude,
              13
            )
          ).subscribe(mapImage => {
            this.placeLocation.mapImg = mapImage;
            this.selectedLocationImg = this.placeLocation.mapImg;
            this.isLoading = false;
            this.locationPick.emit(this.placeLocation);
          });
        });
        modalEl.present();
      });
  }

  selectedLocation(): PlaceLocation {
    if (this.autoLocation) {
      const autoLocatePlace: PlaceLocation = {
        latitude: this.autoLocationCoords.latitude,
        longitude: this.autoLocationCoords.longitude,
        address: null,
        mapImg: null
      };
      this.placeLocation = autoLocatePlace;
      return autoLocatePlace;
    }
    if (this.loadedPlace != null) {
      return this.loadedPlace.location;
    }
    if (this.placeLocation != null) {
      return this.placeLocation;
    }
    const place: PlaceLocation = {
      latitude: 44.8160691,
      longitude: 20.4609349,
      address: null,
      mapImg: null
    };
    this.placeLocation = place;
    return place;
  }

  // private getAddress(lat: any, long: any) {
  //   return this.http
  //     .get(
  //       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=` +
  //         environment.googleMapApiKey
  //     )
  //     .pipe(map(respData => {
  //       console.log(respData);
  //     }));
  // }

  private getMapImage(lat: number, lng: number, zoom: number) {
    console.log(lat, lng);
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${
      environment.googleMapApiKey
    }`;
  }
}
