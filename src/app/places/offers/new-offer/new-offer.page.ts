import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  RequiredValidator
} from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from '../../location.model';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss']
})
export class NewOfferPage implements OnInit {
  form: FormGroup;
  @Input() locationPick: Location;

  constructor(private placesService: PlacesService, private router: Router, private loadingCtrl: LoadingController) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(placeLocation: PlaceLocation) {
    this.form.patchValue({
      location: placeLocation
    });
  }

  onImagePicked(image: string | File) {
    let imageFile;
    if (typeof image === 'string') {
      try {
      const b64ToBlob = require('b64-to-blob');
      const imageInBase64 = image.split(',').pop();
      const imageBlob = b64ToBlob(imageInBase64, 'image/jpeg');
      imageFile = new File([imageBlob], new Date().toDateString() + ' ' + Math.random().toFixed(5).toString());
    } catch (err) {
      console.log(err);
      return;
    }
     } else {
    imageFile = image;
     }
    this.form.patchValue({image: imageFile});
  }


  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Adding place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.uploadImage(this.form.get('image').value).pipe( switchMap(uploadRes => {
          return this.placesService.addPlace(
          this.form.value.title,
          this.form.value.description,
          +this.form.value.price,
          this.form.value.dateFrom,
          this.form.value.dateTo,
          this.form.value.location,
          uploadRes.fileDownloadUri,
        );
      }))
     .subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigateByUrl('/places/tabs/offers');
      });
    });
  }
}
