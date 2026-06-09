import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { BadgeCatalogComponent } from './badge-catalog.component';

@NgModule({
  declarations: [BadgeCatalogComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: BadgeCatalogComponent }
])]
})
export class BadgeCatalogModule {}
