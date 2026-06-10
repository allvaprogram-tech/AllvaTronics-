import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('dist/index.html', 'utf-8');
const dom = new JSDOM(html, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
});

const originalConsoleError = dom.window.console.error;
dom.window.console.error = function(...args) {
    console.log("REACT CONSOLE.ERROR:", ...args);
    originalConsoleError.apply(dom.window.console, args);
};

dom.window.addEventListener("error", (event) => {
    console.error("DOM Error:", event.error.message);
    if (event.error) console.error(event.error.stack);
});
dom.window.addEventListener("unhandledrejection", (event) => {
  console.error("DOM unhandled rejection:", event.reason);
  process.exit(1);
});

setTimeout(() => {
  console.log("No error thrown within 3 seconds");
  process.exit(0);
}, 3000);
