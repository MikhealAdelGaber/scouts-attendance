import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventFormComponent } from './event-form/event-form.component';

const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'new', component: EventFormComponent },
  { path: ':id/edit', component: EventFormComponent }
];

@NgModule({
  declarations: [EventListComponent, EventFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class EventsModule {}
