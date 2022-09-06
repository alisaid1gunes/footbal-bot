export class SettingsHandler {
  public async handle(page: any) {
    await this.goToMenu(page);
    await this.goToSettings(page);
    await this.changeOddFormat(page);
    await this.goToTimeZone(page);
    await this.goToTimeZoneSelect(page);
    await this.goToClose(page);
  }

  public async goToMenu(page: any) {
    await page.waitForSelector('div[class="header__button"][role="button"]');
    await page.click('div[class="header__button"][role="button"]'); //menu button click
  }

  public async goToSettings(page: any) {
    await new Promise(resolve => setTimeout(resolve, 18000));
    await page.waitForSelector(
      'div[class="contextMenu__row"][tabindex="0"][role="button"]'
    );
    console.log("settings");
    await page.evaluate(() => {
      const el = document.querySelector(
        'div[class="contextMenu__row"][tabindex="0"][role="button"]'
      ) as HTMLElement;
      el.click(); //settingsbutton click
    });
  }

  public async changeOddFormat(page: any) {
    console.log("odd select");
    await page.waitForSelector("input[name='oddsFormats'][type='radio']");
    console.log("input[name='oddsFormats'][type='radio']");
    await page.evaluate(() => {
      const el = document.querySelectorAll(
        "input[name='oddsFormats'][type='radio']"
      ) as NodeListOf<HTMLElement>;

      el[1].click(); //odds format click
    });
  }
  public async goToTimeZone(page: any) {
    console.log("timezone");
    await page.waitForSelector(
      'div[class="timeZone__button"][tabindex="0"][role="button"]'
    );
    await page.evaluate(() => {
      const el = document.querySelector(
        'div[class="timeZone__button"][tabindex="0"][role="button"]'
      ) as HTMLElement;
      if (el) {
        el.click(); //timezone button click
      }
    });
  }

  public async goToTimeZoneSelect(page: any) {
    console.log("timezone select");
    await page.waitForSelector(".timeZone__link");
    await page.evaluate(() => {
      const el = document.querySelectorAll(
        ".timeZone__link"
      ) as NodeListOf<HTMLElement>;

      for (let i = 0; i < el.length; i++) {
        const element = el[i];
        if (element.innerText.includes("GMT+0")) {
          console.log(element.innerText);
          element.click(); ///timzone click
        }
      }
    });
  }

  public async goToClose(page: any) {
    console.log("close");
    await page.waitForSelector('svg[class="close modal__closeButton"]');

    const close = await page.$('svg[class="close modal__closeButton"]');
    await close?.click(); //menu close button click
  }
}
