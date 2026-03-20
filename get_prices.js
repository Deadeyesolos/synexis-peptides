const fs = require('fs');

const extractPrices = (file) => {
  const html = fs.readFileSync('products/' + file, 'utf8');
  let prices = {};
  
  // Look for variant buttons first
  const variantMatches = [...html.matchAll(/<button class=\"variant-btn.*?onclick=\"selectVariant\s*\(\s*this,\s*'\\$([0-9.]+)\s*AUD'\s*\)\".*?>([^<]+)<\/button>/g)];
  if (variantMatches.length > 0) {
    variantMatches.forEach(m => {
      prices[m[2].trim()] = parseFloat(m[1]);
    });
  } else {
    // Look for current-price span
    const priceMatch = html.match(/<span class=\"current-price\"[^>]*>\\$([0-9.]+)\s*AUD<\/span>/);
    if (priceMatch) {
      prices['default'] = parseFloat(priceMatch[1]);
    }
  }
  return prices;
};

const catalogue = {
  bacWater: extractPrices('bac-water.html'), /* WILL BE FORCED TO 25 */
  bpc157: extractPrices('bpc157.html'),
  tb500: extractPrices('tb500.html'),
  cjcIpa: extractPrices('cjc1295-ipamorelin.html'),
  tesa: extractPrices('tesamorelin.html'),
  nad: extractPrices('nad.html'),
  bpcTbBlend: extractPrices('bpc157-tb500-blend.html'),
  ghkCu: extractPrices('ghk-cu.html'),
  klow: extractPrices('klow.html'),
  retatrutide: extractPrices('retatrutide.html'),
  ipamorelin: extractPrices('ipamorelin.html'),
  selank: extractPrices('selank.html'),
  semax: extractPrices('semax.html'),
  motsC: extractPrices('mots-c.html')
};

console.log(JSON.stringify(catalogue, null, 2));
