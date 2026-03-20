const fs = require('fs');

const extractPrices = () => {
  const dir = 'products';
  const out = {};
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  for (const f of files) {
    const html = fs.readFileSync(dir + '/' + f, 'utf8');
    let p = {};
    if (f === 'bac-water.html') {
      p['default'] = 25.00; // Hardcode bac-water as requested
      out[f.replace('.html','')] = p;
      continue;
    }
    
    // safe parsing
    const lines = html.split('\n');
    for (const line of lines) {
      if (line.includes('id=\"selectedPrice\"')) {
        const parts = line.split('$');
        if (parts.length > 1) {
          const pb = parts[1].split(' ')[0];
          p['default'] = parseFloat(pb);
        }
      } else if (line.includes('variant-btn') && line.includes('selectVariant')) {
        let priceStr = line.split('$')[1];
        if (priceStr) {
          priceStr = priceStr.split(' ')[0];
          let labelStr = line.split('</button>')[0].split('>');
          let label = labelStr[labelStr.length-1].trim();
          p[label] = parseFloat(priceStr);
        }
      }
    }
    out[f.replace('.html','')] = p;
  }
  return out;
};

console.log(JSON.stringify(extractPrices(), null, 2));
