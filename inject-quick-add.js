/**
 * Injects Quick Add buttons into homepage product cards
 * and adds the Tesamorelin+CJC+Ipa bundle to the bundles section.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Map of product name -> { price, image } for quick-add
const products = [
  { name: 'Retatrutide 10mg',      price: '144.95', img: 'Photos/Retatrutide 10mg.png',    alt: 'Retatrutide 10mg' },
  { name: 'BPC-157 + TB-500 Blend', price: '154.95', img: 'Photos/BpcTb5 10mg.png',         alt: 'BPC-157 + TB-500 Blend' },
  { name: 'GHK-CU 100mg',          price: '114.95', img: 'Photos/GHK-CU 100mg.png',         alt: 'GHK-CU 100mg' },
  { name: 'CJC-1295 + Ipamorelin', price: '124.95', img: 'Photos/BpcTb5 10mg.png',          alt: 'CJC-1295 + Ipamorelin' },
  { name: 'KLOW 80mg',             price: '174.95', img: 'Photos/Klow 80mg.png',             alt: 'KLOW 80mg' },
  { name: 'Mots-C 10mg',           price: '134.95', img: 'Photos/Mots-C 10mg.png',           alt: 'Mots-C 10mg' },
  { name: 'Selank 10mg',           price: '104.95', img: 'Photos/Selank 10mg.png',           alt: 'Selank 10mg' },
  { name: 'Semax 10mg',            price: '114.95', img: 'Photos/Semax 10mg.png',            alt: 'Semax 10mg' },
];

// For each product with 'View Product' button, replace with Quick Add + View split
for (const p of products) {
  const oldBtn = `<div class="add-btn">View Product</div>`;
  const newBtn = `<div class="card-actions">
                            <button class="quick-add-btn" onclick="event.preventDefault(); event.stopPropagation(); addToCartGlobal({name:'${p.name}',price:${p.price},image:'${p.img}',qty:1})"><i class="fas fa-plus"></i> Quick Add</button>
                            <div class="add-btn view-btn">View</div>
                        </div>`;
  // Only replace inside the block that also contains this product's alt text
  // Use a targeted replacement based on the product alt text context
  const searchAlt = new RegExp(
    `(alt="${p.alt.replace(/[+]/g,'\\+').replace(/[()]/g,'\\$&')}"[\\s\\S]{0,400}?)<div class="add-btn">View Product<\/div>`,
    'm'
  );
  html = html.replace(searchAlt, (match, before) => before + newBtn);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Quick-add buttons injected for in-stock cards.');
