const fs = require('fs');
const path = require('path');

const dir = './products';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Generic bundle configurations based on the file name
function getBundleConfig(filename) {
    if (filename.includes('bpc')) {
        return {
            title: "Frequently Bought Together",
            mainName: "BPC-157",
            mainPrice: "129.95",
            mainImg: "../Photos/BPC-157 10mg.png",
            items: [
                { name: 'TB-500', price: '129.95', img: '../Photos/TB-500 10mg.png' },
                { name: 'Bacteriostatic Water', price: '19.95', img: '../Photos/BAC Water 3ml.png' }
            ],
            totalPrice: "279.85",
            discountPrice: "249.95",
            savings: "Save $29.90"
        };
    } else if (filename.includes('cjc')) {
        return {
            title: "Frequently Bought Together",
            mainName: "CJC-1295",
            mainPrice: "129.95",
            mainImg: "../Photos/BpcTb5 10mg.png",
            items: [
                { name: 'Ipamorelin', price: '129.95', img: '../Photos/Ipamorelin 10mg test.png' },
                { name: 'Bacteriostatic Water', price: '19.95', img: '../Photos/BAC Water 3ml.png' }
            ],
            totalPrice: "279.85",
            discountPrice: "249.95",
            savings: "Save $29.90"
        };
    } else if (filename.includes('tesamorelin')) {
        return {
            title: "Frequently Bought Together",
            mainName: "Tesamorelin",
            mainPrice: "119.95",
            mainImg: "../Photos/Tesamorelin 10mg.png",
            items: [
                { name: 'NAD+ (500mg)', price: '109.95', img: '../Photos/NAD+500mg.png' },
                { name: 'Bacteriostatic Water', price: '19.95', img: '../Photos/BAC Water 3ml.png' }
            ],
            totalPrice: "249.85",
            discountPrice: "225.00",
            savings: "Save $24.85"
        };
    } else {
        // Default bundle
        return {
            title: "Frequently Bought Together",
            mainName: "Research Compound",
            mainPrice: "129.95",
            mainImg: "../Photos/BPC-157 10mg.png",
            items: [
                { name: 'Bacteriostatic Water', price: '19.95', img: '../Photos/BAC Water 3ml.png' }
            ],
            totalPrice: "149.90",
            discountPrice: "135.00",
            savings: "Save $14.90"
        };
    }
}

function generateBundleHTML(config, filename) {
    // Generate JS array string for standard bundle items
    // Dynamic JS logic string to extract main item's real price from DOM and combine it
    const bundleItemsStr = config.items.map(i => `{name: "${i.name}", price: "${i.price}", image: "${i.img}", qty: 1}`).join(',');
    
    return `
        <!-- BUNDLE SECTION -->
        <div class="product-bundle">
            <h3>${config.title}</h3>
            <div class="bundle-items">
                <div class="bundle-item main">
                    <img src="${config.mainImg}" alt="${config.mainName}">
                    <div class="bundle-item-info">
                        <strong>This item:</strong> <span>${config.mainName}</span>
                    </div>
                </div>
                ${config.items.map(i => `
                <div class="bundle-plus"><i class="fas fa-plus"></i></div>
                <div class="bundle-item">
                    <img src="${i.img}" alt="${i.name}">
                    <div class="bundle-item-info">
                        <strong>Add-on:</strong> <span>${i.name}</span>
                        <div class="bundle-item-price">$${i.price}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            <div class="bundle-summary">
                <div class="bundle-price-box">
                    <span class="bundle-old-price">$${config.totalPrice}</span>
                    <span class="bundle-new-price">$${config.discountPrice} AUD</span>
                    <span class="bundle-save">${config.savings}</span>
                </div>
                <button class="add-bundle-btn" onclick='addBundleToCart([{name: "${config.mainName}", price: "${config.mainPrice}", image: "${config.mainImg}", qty: 1}, ${bundleItemsStr}])'>
                    Add Bundle to Cart
                </button>
            </div>
        </div>
        <!-- END BUNDLE SECTION -->
`;
}

let count = 0;
files.forEach(f => {
    let p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');

    // 1. Rename "Related Products" to "Researchers also viewed"
    content = content.replace(/<h2>Related Products<\/h2>/g, '<h2>Researchers also viewed</h2>');

    // 2. Update Tabs Logic
    const oldTabsRegex = /<div class="product-tabs">[\s\S]*?(?=<div class="product-faq">)/;
    
    // Create new tabs HTML block
    const newTabsHTML = `
        <div class="product-tabs">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="description">Description</button>
                <button class="tab-btn" data-tab="specifications">Specifications</button>
                <button class="tab-btn" data-tab="storage">Storage</button>
                <button class="tab-btn" data-tab="batch-testing">Batch Testing</button>
                <button class="tab-btn" data-tab="research-info">Research Information</button>
            </div>
            <div class="tab-content active" id="description">
                <h4>Product Description</h4>
                <p>Supplied as a lyophilised powder for research and in-vitro use only. Not for human administration.</p>
            </div>
            <div class="tab-content" id="specifications">
                <h4>Technical Specifications</h4>
                <ul>
                    <li><strong>Purity:</strong> &ge;99% (HPLC Verified)</li>
                    <li><strong>Form:</strong> Lyophilized Solid (White Powder)</li>
                    <li><strong>Storage:</strong> Store at -20&deg;C, protect from light</li>
                    <li><strong>Application:</strong> In-vitro laboratory research</li>
                </ul>
            </div>
            <div class="tab-content" id="storage">
                <h4>Storage Instructions</h4>
                <p>Store lyophilised peptide at -20°C in a dry, dark environment. Reconstitute with bacteriostatic water for laboratory use. Once reconstituted, store refrigerated at 2°C - 8°C.</p>
            </div>
            <div class="tab-content" id="batch-testing">
                <h4>Batch Testing & Quality Assurance</h4>
                <p>All batches undergo rigorous HPLC and MS testing to ensure purity exceeds 99%. Quality documentation is securely logged against specific lot numbers.</p>
                <a href="../coa.html" class="tab-link-btn">View Certificate Library &rsaquo;</a>
            </div>
            <div class="tab-content" id="research-info">
                <h4>Research Information</h4>
                <p>For detailed citations, pathway mapping, and research mechanism data, please visit our knowledge hub. Note: This product is strictly not intended for human or veterinary use.</p>
            </div>
        </div>
        `;

    content = content.replace(oldTabsRegex, newTabsHTML);

    // 3. Inject Bundle UI just before the product-tabs
    const bundleConfig = getBundleConfig(f);
    const bundleHTML = generateBundleHTML(bundleConfig, f);
    
    if (!content.includes('class="product-bundle"')) {
        content = content.replace('<div class="product-tabs">', bundleHTML + '\n        <div class="product-tabs">');
    }

    fs.writeFileSync(p, content, 'utf8');
    count++;
});

console.log('Updated', count, 'product pages.');
