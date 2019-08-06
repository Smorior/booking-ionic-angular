import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit {

  constructor(private modelCtrl: ModalController, private navParams: NavParams) { 
  }

  @Input() center = { lat: 44.8160691, lng: 20.4609349 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick location';

  latitude = 44.8160691;
  longitude = 20.4609349;
  coords;


  ngOnInit() {
    if (this.navParams.get('center') != null) {
    this.center = this.navParams.get('center');
    this.latitude = +this.center.lat;
    this.longitude = +this.center.lng;
    }
  }


  onSubmit() {
    this.modelCtrl.dismiss(this.coords);
  }

  onDismiss() {
    this.modelCtrl.dismiss();
  }

  onMapClick(event) {
    if (this.selectable) {
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;
    this.coords = {
      lat: event.coords.lat,
      lng: event.coords.lng
    };
    console.log(this.coords);
  }
  }

}
