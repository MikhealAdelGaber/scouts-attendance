import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { BadgeCatalogComponent } from './badge-catalog.component';

const routes: Routes = [
  { path: '', component: BadgeCatalogComponent }
];

@NgModule({
  declarations: [BadgeCatalogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class BadgeCatalogModule {}
