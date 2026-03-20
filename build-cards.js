const fs = require('fs');

const PRICES = {
  "BPC-157 10mg": 114.95,
  "TB-500 10mg": 114.95,
  "BPC-157 20mg": 199.95,
  "TB-500 20mg": 199.95,
  "Bacteriostatic Water 10ml": 25.00,
  "CJC-1295 No DAC + Ipamorelin": 139.95,
  "Tesamorelin 10mg": 104.95,
  "Tesamorelin 20mg": 154.95,
  "NAD+": 109.95,
  "BPC-157 + TB-500 Blend 10mg": 154.95,
  "GHK-CU 100mg": 114.95,
  "KLOW 80mg": 174.95,
  "Retatrutide 10mg": 144.95,
  "Retatrutide 20mg": 259.95,
  "Retatrutide 30mg": 349.95
};

const IMAGES = {
  "BPC-157 10mg": "Photos/BPC-157 10mg.png",
  "TB-500 10mg": "Photos/TB-500 10mg.png",
  "BPC-157 20mg": "Photos/BPC-157 10mg.png",
  "TB-500 20mg": "Photos/TB-500 10mg.png",
  "Bacteriostatic Water 10ml": "Photos/BAC Water 3ml.png",
  "CJC-1295 No DAC + Ipamorelin": "Photos/BpcTb5 10mg.png",
  "Tesamorelin 10mg": "Photos/Tesamorelin 10mg.png",
  "Tesamorelin 20mg": "Photos/Tesamorelin 10mg.png",
  "NAD+": "Photos/NAD+500mg.png",
  "BPC-157 + TB-500 Blend 10mg": "Photos/BpcTb5 10mg.png",
  "GHK-CU 100mg": "Photos/GHK-CU 100mg.png",
  "KLOW 80mg": "Photos/Klow 80mg.png",
  "Retatrutide 10mg": "Photos/Retatrutide 10mg.png",
  "Retatrutide 20mg": "Photos/Retatrutide 10mg.png",
  "Retatrutide 30mg": "Photos/Retatrutide 10mg.png"
};

const BUNDLES = [
  { id: 1, name: "Research Recovery Bundle", items: ["BPC-157 10mg", "TB-500 10mg", "Bacteriostatic Water 10ml"] },
  { id: 2, name: "Advanced Recovery Bundle", items: ["BPC-157 20mg", "TB-500 20mg", "Bacteriostatic Water 10ml"] },
  { id: 3, name: "Research Synergy Bundle", items: ["CJC-1295 No DAC + Ipamorelin", "Tesamorelin 10mg", "Bacteriostatic Water 10ml"] },
  { id: 4, name: "Premium Lab Bundle", items: ["Tesamorelin 20mg", "NAD+", "Bacteriostatic Water 10ml"] },
  { id: 5, name: "Popular Blend Bundle", items: ["BPC-157 + TB-500 Blend 10mg", "GHK-CU 100mg", "Bacteriostatic Water 10ml"] },
  { id: 6, name: "Batch Testing Bundle", items: ["GHK-CU 100mg", "KLOW 80mg", "Bacteriostatic Water 10ml"] },
  { id: 7, name: "Research Essentials Bundle", items: ["BPC-157 10mg", "GHK-CU 100mg", "Bacteriostatic Water 10ml"] },
  { id: 8, name: "Compound Pair Bundle", items: ["Retatrutide 10mg", "Tesamorelin 10mg"] },
  { id: 9, name: "Advanced Compound Pair", items: ["Retatrutide 20mg", "Tesamorelin 20mg"] },
  { id: 10, name: "Premium Compound Stack", items: ["Retatrutide 30mg", "Tesamorelin 20mg", "Bacteriostatic Water 10ml"] },
  { id: 11, name: "Entry Research Bundle", items: ["BPC-157 10mg", "TB-500 10mg"] },
  { id: 12, name: "Complete Lab Starter Bundle", items: ["BPC-157 10mg", "TB-500 10mg", "GHK-CU 100mg", "Bacteriostatic Water 10ml"] }
];

function generateCardHTML(b, isDeep = false) {
  let combinedOriginal = 0;
  let cartArr = [];
  let imgTags = '';
  
  b.items.forEach((item, index) => {
    let p = PRICES[item] || 0;
    let img = IMAGES[item];
    if (isDeep) img = '../' + img; // adjust relative path for product pages
    combinedOriginal += p;
    cartArr.push(`{name:"${item.replace(/"/g,'&quot;')}",price:${p},image:"${img}",qty:1}`);
    imgTags += `\n                        <img src="${img}" alt="${item.replace(/"/g,'&quot;')}">`;
  });

  let discount = 0;
  if (b.items.length === 2) discount = 10;
  else if (b.items.length === 3) discount = 20;
  else if (b.items.length === 4) discount = 30;
  
  const salePrice = combinedOriginal - discount;
  const numItems = Math.min(b.items.length, 4);

  return `
            <!-- Bundle ${b.id}: ${b.name} -->
            <div class="product-card" style="cursor:default;">
                <div class="product-badge new">Featured</div>
                <div class="product-image" style="padding: 20px 0;">
                    <div class="bundle-image-stack" data-count="${numItems}">
${imgTags}
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-strength">Research Bundle</div>
                    <h3>${b.name}</h3>
                    <div class="bundle-includes">${b.items.join(' + ')}</div>
                    <div class="price-container">
                        <span class="old-price" style="text-decoration:line-through; color:var(--text-muted); font-size:12px; margin-right:6px;">$${combinedOriginal.toFixed(2)}</span>
                        <span class="price">$${salePrice.toFixed(2)} AUD</span>
                    </div>
                    <div class="card-actions">
                        <button class="quick-add-btn" style="width:100%;" onclick='event.preventDefault(); event.stopPropagation(); addBundleToCart([${cartArr.join(',')}])'>
                            <i class="fas fa-shopping-bag"></i> Add Bundle (Save $${discount.toFixed(2)})
                        </button>
                    </div>
                </div>
            </div>`;
}

// ---------------------------------------------------------
// 1. UPDATE HOMEPAGE
// ---------------------------------------------------------
const homepageBundleIds = [1, 3, 8, 12];
let homeHTML = homepageBundleIds.map(id => generateCardHTML(BUNDLES.find(b => b.id === id), false)).join('\n');

const homepageSection = `<section id="bundles" class="bundles-section">
        <div class="section-header">
            <h2 class="section-title">Featured Research Bundles</h2>
            <p class="section-subtitle">Premium research combinations paired with reconstitution essentials.</p>
        </div>
        <div class="products-grid">
${homeHTML}
        </div>
    </section>`;

let indexHTML = fs.readFileSync('index.html', 'utf8');
const targetBlock = /<section id="bundles" class="bundles-section">[\s\S]*?<\/section>/;
if (targetBlock.test(indexHTML)) {
  indexHTML = indexHTML.replace(targetBlock, homepageSection);
  fs.writeFileSync('index.html', indexHTML);
  console.log("Updated index.html bundles block correctly.");
}

// ---------------------------------------------------------
// 2. UPDATE PRODUCT PAGES
// ---------------------------------------------------------
const pageMappings = {
  'bpc157.html': [1, 2, 7],
  'tb500.html': [1, 2, 11],
  'tesamorelin.html': [3, 4, 8, 9],
  'retatrutide.html': [8, 9, 10],
  'ghk-cu.html': [5, 6, 7]
};

for (const [file, bundles] of Object.entries(pageMappings)) {
   const path = 'products/' + file;
   if(fs.existsSync(path)) {
     let html = fs.readFileSync(path, 'utf8');
     
     let productBundlesHTML = bundles.map(id => generateCardHTML(BUNDLES.find(b => b.id === id), true)).join('\n');
     
     const newStr = `<!-- BUNDLE SECTION -->
        <div class="product-bundle" style="background:transparent; border:none; padding:0;">
            <div class="section-header" style="margin-bottom:24px; text-align:left;">
                <h2 style="font-size:24px;">Frequently Bought Together</h2>
            </div>
            <div class="related-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
${productBundlesHTML}
            </div>
        </div>
        <!-- END BUNDLE SECTION -->`;
     
     const regex = /<!-- BUNDLE SECTION -->[\s\S]*?<!-- END BUNDLE SECTION -->/;
     if (regex.test(html)) {
       html = html.replace(regex, newStr);
       fs.writeFileSync(path, html);
       console.log('Updated ' + file);
     }
   }
}
