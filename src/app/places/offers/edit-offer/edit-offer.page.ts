import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocationPickerComponent } from '../../../shared/pickers/location-picker/location-picker.component';
import { PlaceLocation } from '../../location.model';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss']
})
export class EditOfferPage implements OnInit, OnDestroy {
  offer: Place;
  form: FormGroup;
  private offerSub: Subscription;
  isLoading = false;
  @Input() locationPick: Location;

  constructor(
    private placesService: PlacesService,
    private router: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.router.paramMap.subscribe(p => {
      if (!p.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading = true;
      this.offerSub = this.placesService
        .getPlace(+p.get('placeId'))
        .subscribe(place => {
          this.offer = place;
          this.form = new FormGroup({
            title: new FormControl(this.offer.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.offer.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            }),
            price: new FormControl(this.offer.price, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.min(1)]
            }),
            location: new FormControl(this.offer.location, {
              validators: [Validators.required]
            })
          });
          this.isLoading = false;
        }, error => {
          this.alertController.create({
            header: 'Oooops!',
            message: 'An error has occured! Navigate to safe?',
            buttons: [{
              text: 'Ok',
              handler: () => {
                this.navCtrl.navigateBack('/places/tabs/offers');
              }
            }]
          }).then(alert => {
            alert.present();
          });
        });
    });
  }

  onUpdate() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(
        this.offer.placeId,
        this.form.value.title,
        this.form.value.description,
        this.form.value.price,
        this.form.value.location
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.navCtrl.navigateBack('/places/tabs/offers');
      });
    });
  }

  onLocationPicked(placeLocation: PlaceLocation) {
    this.form.patchValue({location: placeLocation});
  }

  showFullMap() {
    console.log(this.offer.location);
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {lat: this.offer.location.latitude, lng: this.offer.location.longitude},
    }
    }).then(mapModal => {
      mapModal.present();
    });
  }

  ngOnDestroy() {
    if (this.offerSub) {
      this.offerSub.unsubscribe();
    }
  }
}
