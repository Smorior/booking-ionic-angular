import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { IonicModule } from '@ionic/angular';
import { AgmCoreModule } from '@agm/core';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';


@NgModule({
  declarations: [LocationPickerComponent, ImagePickerComponent, MapModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB0b1NJ0xOXCoaU7BeS_TEzvFLUjDu14-w'
    })
  ],
  exports: [LocationPickerComponent,  MapModalComponent, ImagePickerComponent],
  entryComponents: [MapModalComponent]
})
export class SharedModule { }
