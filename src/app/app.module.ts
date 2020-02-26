import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';

import {AppComponent} from './app.component';
import {EnvironmentConfigDatasource} from './environment-config.datasource';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule
  ],
  providers: [
    EnvironmentConfigDatasource
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
