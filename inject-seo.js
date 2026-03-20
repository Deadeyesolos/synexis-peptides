const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://synexispeptides.com.au';

function injectSEO(dir, isProductPage) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Quick extraction to guess title/desc or build dynamically
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        let pageTitle = titleMatch ? titleMatch[1].trim() : "Synexis Peptides | Premium Research Peptides — Australia";
        
        const descMatch = content.match(/<meta name="description" content="(.*?)">/);
        let pageDesc = descMatch ? descMatch[1].trim() : "Synexis Peptides supplies research-grade peptides for Australian customers. Fast dispatch, secure checkout, and clear research-use information.";

        let canonicalUrl = `${DOMAIN}${dir === './' ? '/' : '/' + path.basename(dir) + '/'}${file === 'index.html' ? '' : file}`;

        // If it's a product page, reformat the title to match: "Product Name | Research Peptide | Synexis Peptides"
        let productName = "";
        let productPrice = "129.95";
        let productImg = `${DOMAIN}/Photos/logo.png`;
        let inStock = true;

        if (isProductPage) {
             const h1Match = content.match(/<h1>(.*?)<\/h1>/);
             if (h1Match) productName = h1Match[1].trim();
             pageTitle = `${productName} | Research Peptide | Synexis Peptides`;
             
             // Try to extract price
             const priceMatch = content.match(/<span class="price">.*?\$([\d\.]+)/);
             if (priceMatch) productPrice = priceMatch[1];
             
             // Try to extract image
             const imgMatch = content.match(/<img src="..\/Photos\/([^"]+)"/);
             if (imgMatch) productImg = `${DOMAIN}/Photos/${imgMatch[1]}`;
             
             if(content.includes('sold-out')) inStock = false;
        }

        // Generate Meta tags array to inject
        let newHeadContent = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}">
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="${isProductPage ? 'product' : 'website'}" />
    <meta property="og:image" content="${productImg}" />
    <meta name="twitter:card" content="summary_large_image">`;

        let jsonLd = '';
        if (isProductPage && productName) {
            jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${productName}",
      "image": "${productImg}",
      "description": "${pageDesc}",
      "brand": {
        "@type": "Brand",
        "name": "Synexis Peptides"
      },
      "offers": {
        "@type": "Offer",
        "url": "${canonicalUrl}",
        "priceCurrency": "AUD",
        "price": "${productPrice}",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}"
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "${DOMAIN}"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "${DOMAIN}/index.html#products"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "${productName}"
      }]
    }
    </script>`;
        } else {
             jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Synexis Peptides",
      "url": "${DOMAIN}"
    }
    </script>`;
        }

        newHeadContent += jsonLd;

        // Clean out existing tags before injecting new ones
        content = content.replace(/<title>.*?<\/title>/s, '');
        content = content.replace(/<meta name="description" content=".*?">/s, '');
        content = content.replace(/<link rel="canonical" href=".*?">/s, '');
        content = content.replace(/<meta property="og:.*?>/g, '');
        content = content.replace(/<script type="application\/ld\+json">.*?<\/script>/gs, '');

        // Inject right after <head>
        content = content.replace('<head>', `<head>${newHeadContent}`);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected SEO for: ${filePath}`);
    });
}

injectSEO('./', false);
injectSEO('./products', true);
