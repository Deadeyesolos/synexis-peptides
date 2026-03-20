const fs = require('fs');
const path = require('path');

function injectTrustBadges(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    
    files.forEach(f => {
        let p = path.join(dir, f);
        let content = fs.readFileSync(p, 'utf8');

        // Cart Drawer Trust Badges injection
        const cartFooterRegex = /<a href="([^"]*checkout\.html)" class="checkout-btn">Proceed to Checkout<\/a>\s*<\/div>/;
        
        if (cartFooterRegex.test(content) && !content.includes('cart-trust-badges')) {
            content = content.replace(cartFooterRegex, 
                '<a href="$1" class="checkout-btn">Proceed to Checkout</a>\n            <div class="cart-trust-badges" style="margin-top: 20px; text-align: left; display: flex; flex-direction: column; gap: 8px;">\n                <span style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;"><i class="fas fa-check" style="color: var(--success); font-size: 14px;"></i> Secure encrypted checkout</span>\n                <span style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;"><i class="fas fa-check" style="color: var(--success); font-size: 14px;"></i> Discreet packaging</span>\n                <span style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;"><i class="fas fa-check" style="color: var(--success); font-size: 14px;"></i> Fast Australian dispatch</span>\n            </div>\n        </div>'
            );
            fs.writeFileSync(p, content, 'utf8');
            console.log('Injected trust badges into:', p);
        }
    });
}

injectTrustBadges('./');
injectTrustBadges('./products');
