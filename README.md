# Delius Versions Dashboard

Dashboard: https://ministryofjustice.github.io/delius-versions-dashboard

This project fetches and consolidates information from the [hmpps-env-configs](https://github.com/ministryofjustice/hmpps-env-configs) and the [delius-versions](https://github.com/ministryofjustice/delius-versions) repositories,
to provide a quick high-level view of which application versions are deployed in the Delius AWS environments.

Note: In the case where the configuration has been updated but those changes have not yet been applied to the environment, the versions displayed on the dashboard may be temporarily incorrect.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

This project was initially generated using the [Angular Material Table Schematic](https://material.angular.io/guide/schematics#table-schematic): `ng generate @angular/material:table app`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Continuous Integration

This project uses GitHub Actions ([workflow](.github/workflows/main.yml)), to automatically compile the Angular/Typescript code when pushing to the master branch, so that the latest code is immediately available on GitHub Pages.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
