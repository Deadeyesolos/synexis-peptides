const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://synexispeptides.com.au';
const date = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

function addUrl(url, priority) {
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${date}</lastmod>
    <priority>${priority}</priority>
  </url>\n`;
}

// Root pages
const rootFiles = fs.readdirSync('./').filter(f => f.endsWith('.html'));
rootFiles.forEach(file => {
    // Ignore checkout and order confirmation
    if (file === 'checkout.html' || file === 'order-confirmation.html') return;
    
    let url = `${DOMAIN}/${file === 'index.html' ? '' : file}`;
    let priority = file === 'index.html' ? '1.0' : '0.8';
    addUrl(url, priority);
});

// Product pages
if (fs.existsSync('./products')) {
    const productFiles = fs.readdirSync('./products').filter(f => f.endsWith('.html'));
    productFiles.forEach(file => {
        let url = `${DOMAIN}/products/${file}`;
        addUrl(url, '0.9');
    });
}

sitemap += `</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
console.log('Generated sitemap.xml');

// Robots.txt
const robotsTxt = `User-agent: *
Allow: /

Disallow: /checkout.html
Disallow: /order-confirmation.html
Disallow: /*?*cart*
Disallow: /*?*checkout*

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
console.log('Generated robots.txt');
