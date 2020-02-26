import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  tableExists(): Promise<boolean> {
    return element(by.css('app-root table')).isPresent() as Promise<boolean>;
  }
}
