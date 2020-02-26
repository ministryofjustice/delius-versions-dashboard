import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTable} from '@angular/material/table';
import {EnvironmentConfig} from './model/environment-config';
import {EnvironmentConfigDatasource} from './environment-config.datasource';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<EnvironmentConfig>;

  displayedColumns: string[] = [];
  numRows = 0;

  constructor(public dataSource: EnvironmentConfigDatasource) {
    dataSource.changes.subscribe(data => {
      this.numRows = data.length;
      if (data.length > 0) { this.displayedColumns = Object.keys(data[0]); }
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.table.dataSource = this.dataSource;
  }
}
