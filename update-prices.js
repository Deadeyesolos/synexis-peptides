/**
 * Synexis Peptides — Price Update Script
 * Reduces all product prices by $15 across all HTML files.
 * Run: node update-prices.js
 */

const fs = require('fs');
const path = require('path');

// Price map: [current, new]
// Format: exact string to find → exact string to replace with
const PRICE_REPLACEMENTS = [
  // ── index.html product cards ──────────────────────────────────────────
  // Retatrutide (sale shown)
  ['$169.95</span>\n                             <span class="price">$159.95 AUD</span>',
   '$154.95</span>\n                             <span class="price">$144.95 AUD</span>'],
  // BPC-157 + TB-500 Blend
  ['<span class="price">$169.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- GHK-CU',
   '<span class="price">$154.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- GHK-CU'],
  // GHK-CU card
  ['<span class="price">$129.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- BAC Water',
   '<span class="price">$114.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- BAC Water'],
  // BAC Water card
  ['<span class="price">$19.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- CJC',
   '<span class="price">$9.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- CJC'],
  // CJC-1295 + Ipamorelin (sale)
  ['<span class="old-price">$149.95</span>\n                             <span class="price">$139.95 AUD</span>',
   '<span class="old-price">$134.95</span>\n                             <span class="price">$124.95 AUD</span>'],
  // KLOW
  ['<span class="price">$189.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Mots-C',
   '<span class="price">$174.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Mots-C'],
  // Mots-C
  ['<span class="price">$149.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Semax',
   '<span class="price">$134.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Semax'],
  // Semax
  ['<span class="price">$129.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- BPC-157 - RESTOCKING',
   '<span class="price">$114.95 AUD</span>\n                        </div>\n                        <div class="add-btn">View Product</div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- BPC-157 - RESTOCKING'],
  // BPC-157 card (restocking)
  ['<span class="price">From $129.95 AUD</span></div>\n                        <button class="notify-btn" onclick="event.preventDefault(); toggleNotify(this)">\n                            <i class="fas fa-bell"></i> Notify Me When Back\n                        </button>\n                        <div class="notify-inline">\n                            <input type="email" placeholder="Your email address" />\n                            <button onclick="event.preventDefault(); submitNotify(this)">Alert Me</button>\n                        </div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- TB-500',
   '<span class="price">From $114.95 AUD</span></div>\n                        <button class="notify-btn" onclick="event.preventDefault(); toggleNotify(this)">\n                            <i class="fas fa-bell"></i> Notify Me When Back\n                        </button>\n                        <div class="notify-inline">\n                            <input type="email" placeholder="Your email address" />\n                            <button onclick="event.preventDefault(); submitNotify(this)">Alert Me</button>\n                        </div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- TB-500'],
  // TB-500 card (restocking)
  ['<span class="price">From $129.95 AUD</span></div>\n                        <button class="notify-btn" onclick="event.preventDefault(); toggleNotify(this)">\n                            <i class="fas fa-bell"></i> Notify Me When Back\n                        </button>\n                        <div class="notify-inline">\n                            <input type="email" placeholder="Your email address" />\n                            <button onclick="event.preventDefault(); submitNotify(this)">Alert Me</button>\n                        </div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Tesamorelin',
   '<span class="price">From $114.95 AUD</span></div>\n                        <button class="notify-btn" onclick="event.preventDefault(); toggleNotify(this)">\n                            <i class="fas fa-bell"></i> Notify Me When Back\n                        </button>\n                        <div class="notify-inline">\n                            <input type="email" placeholder="Your email address" />\n                            <button onclick="event.preventDefault(); submitNotify(this)">Alert Me</button>\n                        </div>\n                    </div>\n                </div>\n            </a>\n\n            <!-- Tesamorelin'],
  // Tesamorelin card (sale)
  ['<div class="price-container"><span class="old-price">$149.95</span><span class="price">From $119.95 AUD</span></div>',
   '<div class="price-container"><span class="old-price">$134.95</span><span class="price">From $104.95 AUD</span></div>'],
  // NAD+ card (restocking)
  ['<span class="price">$109.95 AUD</span></div>\n                        <button class="notify-btn"',
   '<span class="price">$94.95 AUD</span></div>\n                        <button class="notify-btn"'],
];

// Simple regex-based replacements for specific patterns across all product HTML files
const REGEX_REPLACEMENTS = [
  // Product page: tb500.html, bpc157.html etc – current-price spans  
  { regex: /\$129\.95 AUD<\/span><\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/a>\s*<!--\s*Ipamorelin/g, replacement: null }, // handled per-file
];

// Per-file price replacements (product pages)
const FILE_PRICES = {
  'products/bpc157.html': [
    // Variant prices
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],  // 10mg current
    ['selectVariant(this, \'$129.95 AUD\')', "selectVariant(this, '$114.95 AUD')"],
    ['"$229.95 AUD"', '"$214.95 AUD"'],  // 20mg
    ['selectVariant(this, \'$229.95 AUD\')', "selectVariant(this, '$214.95 AUD')"],
    ['$229.95 AUD</span>', '$214.95 AUD</span>'],
    // Cart button price
    ['<span id="cartBtnPrice">$129.95</span>', '<span id="cartBtnPrice">$114.95</span>'],
    ['addToCartPage(\'BPC-157\', document.getElementById(\'selectedPrice\').textContent)', 
     "addToCartPage('BPC-157', document.getElementById('selectedPrice').textContent)"],
    // Bundle on bpc157 page
    ['$279.85</span>', '$239.85</span>'],
    ['$249.95 AUD</span>', '$209.95 AUD</span>'],
    ['Save $29.90</span>', 'Save $29.90</span>'],
    // bundle items
    ['price: \"129.95\", image: \"../Photos/BPC-157 10mg.png\"', 'price: "114.95", image: "../Photos/BPC-157 10mg.png"'],
    ['price: \"129.95\", image: \"../Photos/TB-500 10mg.png\"', 'price: "114.95", image: "../Photos/TB-500 10mg.png"'],
    ['price: \"19.95\", image: \"../Photos/BAC Water 3ml.png\"', 'price: "9.95", image: "../Photos/BAC Water 3ml.png"'],
    // Old price in related products section
    ['$139.95 AUD</span></div>\n                </a>\n                <a href="tb500.html"', '$124.95 AUD</span></div>\n                </a>\n                <a href="tb500.html"'],
    ['$129.95 AUD</span></div>\n                </a>\n                <a href="bac-water.html"', '$114.95 AUD</span></div>\n                </a>\n                <a href="bac-water.html"'],
    ['$19.95 AUD</span>', '$9.95 AUD</span>'],
  ],
  'products/tb500.html': [
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],
    ["selectVariant(this, '$129.95 AUD')", "selectVariant(this, '$114.95 AUD')"],
    ['$229.95 AUD</span>', '$214.95 AUD</span>'],
    ["selectVariant(this, '$229.95 AUD')", "selectVariant(this, '$214.95 AUD')"],
    ['<span id="cartBtnPrice">$129.95</span>', '<span id="cartBtnPrice">$114.95</span>'],
    // bundle
    ['$259.85</span>', '$239.85</span>'],
    ['$229.95 AUD</span>', '$209.95 AUD</span>'],
    ['price: "129.95", image: "../Photos/BPC-157 10mg.png"', 'price: "114.95", image: "../Photos/BPC-157 10mg.png"'],
    ['price: "129.95", image: "../Photos/TB-500 10mg.png"', 'price: "114.95", image: "../Photos/TB-500 10mg.png"'],
    ['price: "19.95", image: "../Photos/BAC Water 3ml.png"', 'price: "9.95", image: "../Photos/BAC Water 3ml.png"'],
  ],
  'products/bpc157-tb500-blend.html': [
    ['$169.95 AUD</span>', '$154.95 AUD</span>'],
    ["selectVariant(this, '$169.95 AUD')", "selectVariant(this, '$154.95 AUD')"],
    ['<span id="cartBtnPrice">$169.95</span>', '<span id="cartBtnPrice">$154.95</span>'],
    // Bundle section prices
    ['$279.85</span>', '$239.85</span>'],
    ['$249.95 AUD</span>', '$209.95 AUD</span>'],
    ['price: "129.95", image: "../Photos/BPC-157 10mg.png"', 'price: "114.95", image: "../Photos/BPC-157 10mg.png"'],
    ['price: "129.95", image: "../Photos/TB-500 10mg.png"', 'price: "114.95", image: "../Photos/TB-500 10mg.png"'],
    ['price: "19.95", image: "../Photos/BAC Water 3ml.png"', 'price: "9.95", image: "../Photos/BAC Water 3ml.png"'],
    ['$129.95</div>', '$114.95</div>'],
  ],
  'products/cjc1295-ipamorelin.html': [
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
    ['$139.95 AUD</span>', '$124.95 AUD</span>'],
    ["selectVariant(this, '$139.95 AUD')", "selectVariant(this, '$124.95 AUD')"],
    ['<span id="cartBtnPrice">$139.95</span>', '<span id="cartBtnPrice">$124.95</span>'],
    ['Save $10</span>', 'Save $10</span>'],
    // Bundle on this page
    ['price: "119.95"', 'price: "104.95"'],
    ['price: "129.95"', 'price: "114.95"'],
    ['$249.90</span>', '$219.90</span>'],
    ['$219.95 AUD</span>', '$189.95 AUD</span>'],
  ],
  'products/tesamorelin.html': [
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
    ['$119.95 AUD</span>', '$104.95 AUD</span>'],
    ["selectVariant(this, '$119.95 AUD')", "selectVariant(this, '$104.95 AUD')"],
    ['$219.95 AUD</span>', '$204.95 AUD</span>'],
    ["selectVariant(this, '$219.95 AUD')", "selectVariant(this, '$204.95 AUD')"],
    ['<span id="cartBtnPrice">$119.95</span>', '<span id="cartBtnPrice">$104.95</span>'],
    ['Save $30</span>', 'Save $30</span>'],
    // bundle
    ['price: "119.95", image: "../Photos/Tesamorelin 10mg.png"', 'price: "104.95", image: "../Photos/Tesamorelin 10mg.png"'],
    ['price: "109.95", image: "../Photos/NAD+500mg.png"', 'price: "94.95", image: "../Photos/NAD+500mg.png"'],
    ['$229.90</span>', '$199.90</span>'],
    ['$199.95 AUD</span>', '$169.95 AUD</span>'],
  ],
  'products/nad.html': [
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
    ['$109.95 AUD</span>', '$94.95 AUD</span>'],
    ["selectVariant(this, '$109.95 AUD')", "selectVariant(this, '$94.95 AUD')"],
    ['<span id="cartBtnPrice">$109.95</span>', '<span id="cartBtnPrice">$94.95</span>'],
    ['Save $40</span>', 'Save $40</span>'],
    // bundle
    ['price: "119.95", image: "../Photos/Tesamorelin 10mg.png"', 'price: "104.95", image: "../Photos/Tesamorelin 10mg.png"'],
    ['price: "109.95"', 'price: "94.95"'],
    ['$229.90</span>', '$199.90</span>'],
    ['$199.95 AUD</span>', '$169.95 AUD</span>'],
  ],
  'products/retatrutide.html': [
    ['$169.95</span>', '$154.95</span>'],
    ['$159.95 AUD</span>', '$144.95 AUD</span>'],
    ["selectVariant(this, '$159.95 AUD')", "selectVariant(this, '$144.95 AUD')"],
    ['$289.95 AUD</span>', '$274.95 AUD</span>'],
    ["selectVariant(this, '$289.95 AUD')", "selectVariant(this, '$274.95 AUD')"],
    ['$399.95 AUD</span>', '$384.95 AUD</span>'],
    ["selectVariant(this, '$399.95 AUD')", "selectVariant(this, '$384.95 AUD')"],
    ['<span id="cartBtnPrice">$159.95</span>', '<span id="cartBtnPrice">$144.95</span>'],
    // Bundle
    ['price: "159.95"', 'price: "144.95"'],
    ['price: "119.95", image: "../Photos/Tesamorelin 10mg.png"', 'price: "104.95", image: "../Photos/Tesamorelin 10mg.png"'],
    ['$279.90</span>', '$249.90</span>'],
    ['$249.95 AUD</span>', '$214.95 AUD</span>'],
  ],
  'products/ghk-cu.html': [
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],
    // bundle
    ['price: "129.95"', 'price: "114.95"'],
    ['price: "119.95"', 'price: "104.95"'],
    ['price: "19.95"', 'price: "9.95"'],
    ['$19.95</div>', '$9.95</div>'],
    ['$278.85</span>', '$228.85</span>'],
    ['$248.95 AUD</span>', '$198.95 AUD</span>'],
  ],
  'products/klow.html': [
    ['$189.95 AUD</span>', '$174.95 AUD</span>'],
  ],
  'products/bac-water.html': [
    ['From $19.95 AUD</span>', 'From $9.95 AUD</span>'],
    ['$19.95</span>', '$9.95</span>'],
    ['price: "19.95"', 'price: "9.95"'],
    ['$19.95</div>', '$9.95</div>'],
  ],
  'products/ipamorelin.html': [
    ['$119.95 AUD</span>', '$104.95 AUD</span>'],
    ['price: "129.95"', 'price: "114.95"'],
    ['price: "19.95"', 'price: "9.95"'],
    ['$149.90</span>', '$124.90</span>'],
    ['$135.00 AUD</span>', '$120.00 AUD</span>'],
    ['$14.90</span>', '$4.90</span>'],
    // related products prices
    ['$139.95 AUD</span>', '$124.95 AUD</span>'],
    ['$159.95 AUD</span>', '$144.95 AUD</span>'],
  ],
  'products/selank.html': [
    ['$119.95 AUD</span>', '$104.95 AUD</span>'],
    ['price: "129.95"', 'price: "114.95"'],
    ['price: "19.95"', 'price: "9.95"'],
    ['$149.90</span>', '$124.90</span>'],
    ['$135.00 AUD</span>', '$120.00 AUD</span>'],
    // related products
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
  ],
  'products/semax.html': [
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],
    ['price: "129.95"', 'price: "114.95"'],
    ['price: "19.95"', 'price: "9.95"'],
    // related products
    ['$119.95 AUD</span>', '$104.95 AUD</span>'],
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
  ],
  'products/mots-c.html': [
    ['$149.95 AUD</span>', '$134.95 AUD</span>'],
    ['price: "149.95"', 'price: "134.95"'],
    ['price: "19.95"', 'price: "9.95"'],
    // related
    ['$129.95 AUD</span>', '$114.95 AUD</span>'],
    ['$119.95 AUD</span>', '$104.95 AUD</span>'],
  ],
};

const ROOT = path.join(__dirname);

function processFile(relPath, replacements) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ File not found: ${relPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ ${relPath} — ${count} replacement(s) made`);
}

// -- Process index.html with global replacements --
console.log('\n📦 Updating index.html...');
const indexPath = path.join(ROOT, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Simple price replacements for index.html - using regex for safety
const indexReplacements = [
  // Retatrutide sale card
  [/<span class="old-price">\$169\.95<\/span>\s*\n\s*<span class="price">\$159\.95 AUD<\/span>/g,
   '<span class="old-price">$154.95</span>\n                             <span class="price">$144.95 AUD</span>'],
  // BPC-157 + TB blend card
  [/<span class="price">\$169\.95 AUD<\/span>/g, '<span class="price">$154.95 AUD</span>'],
  // GHK-CU, Semax (all $129.95 in product grid - these are distinct items)
  // We'll do this carefully matching context
  // BAC Water
  [/<span class="price">\$19\.95 AUD<\/span>/g, '<span class="price">$9.95 AUD</span>'],
  // CJC-1295 + ipa sale
  [/<span class="old-price">\$149\.95<\/span>\s*\n\s*<span class="price">\$139\.95 AUD<\/span>/g,
   '<span class="old-price">$134.95</span>\n                             <span class="price">$124.95 AUD</span>'],
  // KLOW
  [/<span class="price">\$189\.95 AUD<\/span>/g, '<span class="price">$174.95 AUD</span>'],
  // Mots-C
  [/<span class="price">\$149\.95 AUD<\/span>/g, '<span class="price">$134.95 AUD</span>'],
  // BPC-157 restocking card
  [/From \$129\.95 AUD<\/span/g, 'From $114.95 AUD</span'],
  // TB-500 restocking card (same pattern, covered above)
  // Tesamorelin sale
  [/<span class="old-price">\$149\.95<\/span><span class="price">From \$119\.95 AUD<\/span>/g,
   '<span class="old-price">$134.95</span><span class="price">From $104.95 AUD</span>'],
  // NAD+ restocking  
  [/<span class="price">\$109\.95 AUD<\/span><\/div>\s*<button class="notify-btn"/g,
   '<span class="price">$94.95 AUD</span></div>\n                        <button class="notify-btn"'],
  // Ipamorelin, Selank, Tesamorelin (all $119.95 in product grid)  
  [/<span class="price">\$119\.95 AUD<\/span>/g, '<span class="price">$104.95 AUD</span>'],
  // Semax ($129.95 in grid)
  [/<span class="price">\$129\.95 AUD<\/span>/g, '<span class="price">$114.95 AUD</span>'],
];

for (const [regex, replacement] of indexReplacements) {
  indexContent = indexContent.replace(regex, replacement);
}

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('  ✅ index.html updated');

// -- Process product pages --
console.log('\n🧪 Updating product pages...');
for (const [relPath, replacements] of Object.entries(FILE_PRICES)) {
  processFile(relPath, replacements);
}

console.log('\n✅ All price updates complete!');
