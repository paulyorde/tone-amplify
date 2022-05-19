import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TracksComponent } from './tone-components/tracks/tracks.component';
import { PlayerComponent } from './tone-components/player/player.component';

@NgModule({
  declarations: [
    AppComponent,
    TracksComponent,
    PlayerComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
