const path = require('path');
const assert = require('assert');

const webExtensionsGeckoDriver = require('webextensions-geckodriver');
const webdriver = webExtensionsGeckoDriver.webdriver;
const firefox = webExtensionsGeckoDriver.firefox;
const until = webdriver.until;
const By = webdriver.By;

const manifestPath = path.resolve(path.join(__dirname, '../src/manifest.json'));

describe('Example WebExtension', () => {
  let geckodriver, helper;

  before(async () => {
    const webExtension = await webExtensionsGeckoDriver(manifestPath);
    geckodriver = webExtension.geckodriver;
    helper = {
      toolbarButton() {
        return geckodriver.wait(until.elementLocated(
          By.id('_examplewebextension-browser-action')
        ), 1000);
      }
    };
  });

  it('should have a Toolbar Button', async () => {
    const button = await helper.toolbarButton();
    assert.equal(await button.getAttribute('tooltiptext'), 'Visit Mozilla');
  });

  it('should visit mozilla if the Toolbar Button is clicked', async () => {
    await geckodriver.getAllWindowHandles();
    const button = await helper.toolbarButton();
    button.click();

    let handles;
    await geckodriver.wait(async () => {
      handles = await geckodriver.getAllWindowHandles();
      return handles.length === 2;
    }, 2000, 'Should have opened a new tab');

    geckodriver.setContext(firefox.Context.CONTENT);
    await geckodriver.switchTo().window(handles[1]);

    await geckodriver.wait(async () => {
      const currentUrl = await geckodriver.getCurrentUrl();

      return currentUrl === 'https://www.mozilla.org/en-US/';
    }, 5000, 'Should have loaded mozilla.org');
  });

  after(function() {
    return geckodriver.quit();
  });
});