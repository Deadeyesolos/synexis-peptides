const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'products');
if (!fs.existsSync(productsDir)) {
    console.error("products folder not found!");
    process.exit(1);
}

const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let html = fs.readFileSync(path.join(productsDir, file), 'utf8');

    // 1. FAQ Schema Injection
    if (html.includes('<div class="faq-item">') && !html.includes('"@type": "FAQPage"')) {
        let faqMatches = [...html.matchAll(/<button class="faq-question"><span>(.*?)<\/span>[\s\S]*?<div class="faq-answer"><p>(.*?)<\/p><\/div>/g)];
        if (faqMatches.length > 0) {
            let faqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqMatches.map(m => ({
                    "@type": "Question",
                    "name": m[1].trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": m[2].trim()
                    }
                }))
            };
            let schemaHtml = `\n    <script type="application/ld+json">\n    ${JSON.stringify(faqSchema, null, 4)}\n    </script>\n`;
            html = html.replace('<!-- SEO tags will be injected here during build -->', schemaHtml + '<!-- SEO tags will be injected here during build -->');
        }
    }

    // 2. Add dynamic Product Inventory Indicators
    if (!html.includes('<div class="inventory-indicator')) {
        let rng = Math.floor(Math.random() * 100);
        let inventoryStatus = '';
        if (rng < 30) {
            let left = Math.floor(Math.random() * 15) + 3;
            // low-stock style
            inventoryStatus = `<div class="inventory-indicator low-stock" style="margin-bottom: 16px; padding: 12px 16px; background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.2); border-radius: 8px; color: #ff6b6b; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px;"><i class="fas fa-fire"></i> <span>Low Stock &mdash; Only ${left} remaining</span></div>`;
        } else if (rng < 50) {
            inventoryStatus = `<div class="inventory-indicator restocking-soon" style="margin-bottom: 16px; padding: 12px 16px; background: rgba(254, 202, 87, 0.1); border: 1px solid rgba(254, 202, 87, 0.2); border-radius: 8px; color: #feca57; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px;"><i class="fas fa-clock"></i> <span>High Demand &mdash; Restocking Soon</span></div>`;
        } else {
            inventoryStatus = `<div class="inventory-indicator in-stock" style="margin-bottom: 16px; padding: 12px 16px; background: rgba(29, 209, 161, 0.1); border: 1px solid rgba(29, 209, 161, 0.2); border-radius: 8px; color: #1dd1a1; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px;"><i class="fas fa-check-circle"></i> <span>In Stock & Ready to Dispatch</span></div>`;
        }

        // Inject right above detail-actions
        html = html.replace('<div class="detail-actions">', `${inventoryStatus}\n                <div class="detail-actions">`);
    }

    // 3. Inject "Research Articles Related to This Compound" block
    if (!html.includes('class="product-research-articles"')) {
        let h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        let h3Match = html.match(/<h3[^>]*>(.*?)<\/h3>/); // fallback
        let compoundName = "This Compound";
        
        if (h1Match) {
            compoundName = h1Match[1].trim();
        } else if (h3Match) {
            compoundName = h3Match[1].trim();
        }
        
        // Handle blends or long names
        let shortName = compoundName.split(' ')[0];
        if (shortName.length < 3) shortName = compoundName;

        let relatedResearchHTML = `
        <!-- Related Research Articles -->
        <div class="product-research-articles" style="margin-top: 60px;">
            <h2 style="font-size: 24px; color: var(--text-white); margin-bottom: 24px; text-align: left; border-bottom: 1px solid var(--border-card); padding-bottom: 12px;">Research Articles Related to ${shortName}</h2>
            <div class="research-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                <div class="article-card" style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
                    <div style="padding: 24px;">
                        <h3 style="font-size: 18px; color: var(--text-white); margin-bottom: 12px;">Laboratory Storage Protocols</h3>
                        <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Essential guidelines for preventing thermal molecular degradation and proper reconstitution techniques.</p>
                        <a href="../peptide-storage-guidelines.html" style="color: var(--primary-light); font-size: 14px; font-weight: 500;">Read Protocol &rarr;</a>
                    </div>
                </div>
                <div class="article-card" style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
                    <div style="padding: 24px;">
                        <h3 style="font-size: 18px; color: var(--text-white); margin-bottom: 12px;">How Batch Testing Works</h3>
                        <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Understanding High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry purity standards.</p>
                        <a href="../how-batch-testing-works.html" style="color: var(--primary-light); font-size: 14px; font-weight: 500;">Read Methodology &rarr;</a>
                    </div>
                </div>
            </div>
            <a href="../knowledge-hub.html" style="display: inline-block; margin-top: 24px; color: var(--primary); font-size: 14px; font-weight: 600;">View all research articles &rarr;</a>
        </div>
        `;
        html = html.replace('<!-- Related Products -->', `${relatedResearchHTML}\n        <!-- Related Products -->`);
    }

    fs.writeFileSync(path.join(productsDir, file), html, 'utf8');
});

console.log("Successfully injected FAQ Schema, Inventory Badges, and Research Article Links into product pages.");
