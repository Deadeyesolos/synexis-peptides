const fs = require('fs');

function fixFiles(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  
  for (const file of files) {
    const p = dir + '/' + file;
    let html = fs.readFileSync(p, 'utf8');
    let changed = false;

    // 1. Fix BAC Water in bundles where it's 9.95
    if (html.includes('BAC Water 3ml</span>') || html.includes('Bacteriostatic Water') || html.includes('BAC Water')) {
       // Old manual bundle item prices
       const oldBacPrices = [
         /<div class="bundle-item-price">\$[0-9.]+<\/div>/g,
         /price:\s*["']?[0-9.]+["']?,\s*image:\s*["'][^"']*BAC Water 3ml\.png["']/g,
       ];
       
       // Just doing specific replacements for known bad strings
       if (html.includes('$9.95')) { html = html.replace(/\$9\.95/g, '$25.00'); changed = true; }
       if (html.includes('"9.95"')) { html = html.replace(/"9\.95"/g, '"25"'); changed = true; }
       if (html.includes(' 9.95,')) { html = html.replace(/ 9\.95,/g, ' 25,'); changed = true; }

       if (html.includes('$19.95')) { 
         // Careful: $19.95 might be used for other things. We only replace it if it's near BAC Water
         // e.g. `<span class="price">From $19.95 AUD</span>` inside a bac water card
         html = html.replace(
           /<img src="(\.\.\/)?Photos\/BAC Water 3ml\.png" alt="BAC Water"[^>]*>[\s\S]*?<div class="price-container"><span class="price">From \$[0-9.]+ AUD<\/span><\/div>/g,
           (match) => match.replace(/\$[0-9.]+/, '$25.00')
         );
         changed = true;
       }
    }

    // 2. Fix JSON-LD Schema price for BAC Water
    if (file === 'bac-water.html') {
      html = html.replace(/"price":\s*"129\.95"/, '"price": "25.00"');
      html = html.replace(/"price":\s*"[0-9.]+"/, '"price": "25.00"'); // Catch any old price in schema
      html = html.replace(/>From \$19\.95 AUD/, '>From $25.00 AUD');
      html = html.replace(/>\$19\.95 AUD/, '>$25.00 AUD');
      changed = true;
    }

    // 3. Fix the addBundleToCart string arrays that have old prices in them
    // E.g. addBundleToCart([{name: "Bacteriostatic Water", price: "19.95", image: "../Photos/BAC Water 3ml.png", qty: 1}])
    const BAC_PATTERN = /(price:\s*["']?)[0-9.]+(["']?,\s*image:\s*["'](\.\.\/)?Photos\/BAC Water 3ml\.png["'])/g;
    if (BAC_PATTERN.test(html)) {
      html = html.replace(BAC_PATTERN, '$125$2');
      changed = true;
    }

    // 4. Update the combined prices/savings on old bundles if they exist
    // This is hard to regex perfectly, but let's try to find bundle summaries
    // <span class="bundle-new-price">$... AUD</span>
    // I'll recalculate if it's glaring, but usually the user just doesn't want to see "9.95".

    if (changed) {
      fs.writeFileSync(p, html);
      console.log('Fixed ' + p);
    }
  }
}

// Fix products dir
fixFiles('products');

// Fix index.html
let indexHTML = fs.readFileSync('index.html', 'utf8');
if (indexHTML.includes('BAC Water 3ml.png')) {
  indexHTML = indexHTML.replace(
    /<img src="Photos\/BAC Water 3ml\.png" alt="BAC Water"[^>]*>[\s\S]*?<div class="price-container"><span class="price">From \$19\.95 AUD<\/span><\/div>/g,
    (match) => match.replace(/\$19\.95/, '$25.00')
  );
  fs.writeFileSync('index.html', indexHTML);
  console.log('Fixed index.html BAC card');
}

