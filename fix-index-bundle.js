const fs = require('fs');
let indexHTML = fs.readFileSync('index.html', 'utf8');

// I will just replace the whole section id="bundles"
const targetBlock = /<section id="bundles" class="bundles-section">[\s\S]*?<\/section>/;

let hpStr = fs.readFileSync('build-bundles.js', 'utf8');
// Evaluate the required bundles block from build-bundles.js by running it directly via execSync
// Actually, let's just copy the relevant code logic for index.html here:
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

function generateBundleHTML(b) {
  let combinedOriginal = 0;
  let cartArr = [];
  let htmlItems = '';
  
  b.items.forEach((item, index) => {
    const p = PRICES[item];
    const img = IMAGES[item];
    combinedOriginal += p;
    cartArr.push(`{name:"${item}",price:"${p}",image:"${img}",qty:1}`);
    
    htmlItems += `
                    <div class="bhp-item">
                        <img src="${img}" alt="${item}">
                        <span>${item}</span>
                    </div>`;
    if (index < b.items.length - 1) {
      htmlItems += `\n                    <div class="bhp-plus"><i class="fas fa-plus"></i></div>`;
    }
  });

  let discount = 0;
  if (b.items.length === 2) discount = 10;
  else if (b.items.length === 3) discount = 20;
  else if (b.items.length === 4) discount = 30;
  
  const salePrice = combinedOriginal - discount;

  return `
            <!-- Bundle ${b.id}: ${b.name} -->
            <div class="bundle-hero-card">
                <div class="bundle-hero-badge">Featured</div>
                <h3 class="bundle-hero-name">${b.name}</h3>
                <div class="bundle-hero-products">
${htmlItems}
                </div>
                <div class="bundle-hero-pricing">
                    <div class="bundle-hero-orig">Individual: <s>$${combinedOriginal.toFixed(2)}</s></div>
                    <div class="bundle-hero-price">$${salePrice.toFixed(2)} AUD</div>
                    <div class="bundle-hero-save">Save $${discount.toFixed(2)}</div>
                </div>
                <button class="bundle-hero-btn" onclick='addBundleToCart([${cartArr.join(',')}])'>
                    <i class="fas fa-shopping-bag"></i> Add Bundle to Cart
                </button>
            </div>`;
}

const homepageBundleIds = [1, 3, 8, 12];
let homeHTML = homepageBundleIds.map(id => generateBundleHTML(BUNDLES.find(b => b.id === id))).join('\n');

const homepageSection = `<section id="bundles" class="bundles-section">
        <div class="section-header">
            <h2 class="section-title">Featured Research Bundles</h2>
            <p class="section-subtitle">Premium research combinations paired with reconstitution essentials.</p>
        </div>
        <div class="bundles-grid">
${homeHTML}
        </div>
    </section>`;

indexHTML = indexHTML.replace(targetBlock, homepageSection);
fs.writeFileSync('index.html', indexHTML);
console.log("Updated index.html bundles block correctly.");
