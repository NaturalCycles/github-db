// // DEBUG=nc* yarn tsn try
//
// import { getGot } from '@naturalcycles/nodejs-lib'
// import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
// import { Options } from 'chrome-launcher'
// import * as chromeLauncher from 'chrome-launcher'
// import * as puppeteer from 'puppeteer'
// const lighthouse = require('lighthouse')
// const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
//
// const options = {
//   logLevel: 'info',
//   disableDeviceEmulation: true,
//   chromeFlags: ['--disable-mobile-emulation']
// } as Options
//
// const url = 'https://bbc.com'
// const config = null
//
// runScript(async () => {
//   // Launch chrome using chrome-launcher
//   const chrome = await chromeLauncher.launch(options)
//   options.port = chrome.port
//
//   // Connect chrome-launcher to puppeteer
//   const {Browser, webSocketDebuggerUrl} = await getGot().get(`http://localhost:${options.port}/json/version`).json()
//   // console.log(resp)
//   console.log({Browser, webSocketDebuggerUrl})
//   const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
//
//   // Run Lighthouse
//   const { lhr } = await lighthouse(url, options, config);
//   await browser.disconnect();
//   await chrome.kill();
//
//   const json = reportGenerator.generateReport(lhr, 'json');
//
//   const audits = JSON.parse(json).audits; // Lighthouse audits
//   const first_contentful_paint = audits['first-contentful-paint'].displayValue;
//   const total_blocking_time = audits['total-blocking-time'].displayValue;
//   const time_to_interactive = audits['interactive'].displayValue;
//
//   console.log(`\n
//      Lighthouse metrics:
//      🎨 First Contentful Paint: ${first_contentful_paint},
//      ⌛️ Total Blocking Time: ${total_blocking_time},
//      👆 Time To Interactive: ${time_to_interactive}`);
// })
