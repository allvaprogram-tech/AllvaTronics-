export function compileCppToJS(code: string): string {
    let jsCode = `
// Arduino API Mock
window.mcu_pins = {};

window.HIGH = 1;
window.LOW = 0;
window.OUTPUT = 1;
window.INPUT = 0;
window.INPUT_PULLUP = 2;

window.pinMode = function(pin, mode) {
  console.log("pinMode", pin, mode);
};

window.digitalWrite = function(pin, value) {
  window.mcu_pins[pin] = value ? 5 : 0;
};

window.digitalRead = function(pin) {
  return window.mcu_pins[pin] > 2.5 ? 1 : 0;
};

window.analogRead = function(pin) {
  return Math.round((window.mcu_pins[pin] || 0) * (1023 / 5)); // 0-5V to 0-1023
};

window.analogWrite = function(pin, value) {
  window.mcu_pins[pin] = (value / 255) * 5;
};


window.Serial = {
  begin: function(...args) { console.log("Serial.begin", ...args); },
  print: function(...args) { console.log("Serial.print", ...args); },
  println: function(...args) { console.log("Serial.println", ...args); }
};

// Simple Adafruit_SSD1306 Mock
window.SSD1306_SWITCHCAPVCC = 0x2;
window.WHITE = 1;
window.BLACK = 0;
window.INVERSE = 2;

window.Adafruit_SSD1306 = class {
  constructor(w, h, wire, reset) {
    this.w = w || 128; this.h = h || 64;
    window.oled_content = [];
    window.oled_cursor = {x: 0, y: 0};
    window.oled_text_size = 1;
    window.oled_text_color = window.WHITE;
  }
  begin() { return true; }
  clearDisplay() { window.oled_content = []; }
  display() { 
    if (window.on_oled_update) window.on_oled_update(JSON.parse(JSON.stringify(window.oled_content))); 
  }
  setCursor(x, y) { window.oled_cursor = {x, y}; }
  setTextSize(s) { window.oled_text_size = s; }
  setTextColor(c) { window.oled_text_color = c; }
  print(t) { 
    window.oled_content.push({type: 'text', x: window.oled_cursor.x, y: window.oled_cursor.y, text: String(t), size: window.oled_text_size, color: window.oled_text_color}); 
    window.oled_cursor.x += String(t).length * 6 * window.oled_text_size;
  }
  println(t) { 
    this.print(t); 
    window.oled_cursor.y += 8 * window.oled_text_size;
    window.oled_cursor.x = 0; 
  }
  drawPixel(x, y, color) { window.oled_content.push({type: 'pixel', x, y, color}); }
  drawLine(x0, y0, x1, y1, color) { window.oled_content.push({type: 'line', x0, y0, x1, y1, color}); }
  drawRect(x, y, w, h, color) { window.oled_content.push({type: 'rect', x, y, w, h, color}); }
  fillRect(x, y, w, h, color) { window.oled_content.push({type: 'fillRect', x, y, w, h, color}); }
  drawCircle(x, y, r, color) { window.oled_content.push({type: 'circle', x, y, r, color}); }
  drawBitmap(x, y, bmp, w, h, color) { /* simple mock */ }
};
` + code
        .replace(/#include\s+<[^>]+>/g, '// include')
        .replace(/Adafruit_SSD1306\s+(\w+)\s*\([^)]*\);/g, 'let $1 = new window.Adafruit_SSD1306();')
        .replace(/void\s+setup\s*\(\)\s*\{/g, 'window.mcu_setup = async function() {')
        .replace(/void\s+loop\s*\(\)\s*\{/g, 'window.mcu_loop = async function() {')
        .replace(/\bint\s+/g, 'let ')
        .replace(/\bfloat\s+/g, 'let ')
        .replace(/\bdouble\s+/g, 'let ')
        .replace(/\bString\s+/g, 'let ')
        .replace(/\bbool\s+/g, 'let ')
        .replace(/\buint8_t\s+/g, 'let ')
        .replace(/\buint16_t\s+/g, 'let ')
        .replace(/\buint32_t\s+/g, 'let ')
        .replace(/\bconst\s+let\b/g, 'const')
        .replace(/#define\s+(\w+)\s+([^\n]+)/g, 'const $1 = $2;')
        .replace(/delay\(([^)]+)\);/g, 'await new Promise(r => setTimeout(r, $1));');
    
    jsCode += `

// Setup execution environment
(async () => {
  if(typeof window.mcu_setup === 'function') { 
    await window.mcu_setup(); 
  }
  
  if(typeof window.mcu_loop === 'function') {
    window.mcu_interval = setInterval(async () => {
      try {
        await window.mcu_loop();
      } catch(e) {
        console.error(e);
        clearInterval(window.mcu_interval);
      }
    }, 100);
  }
})();
`;
    return jsCode;
}
