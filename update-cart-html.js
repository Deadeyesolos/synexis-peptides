const fs = require('fs');
const path = require('path');

const cartHtml = `
    <!-- ==================== CART DRAWER ==================== -->
    <div class="cart-overlay" id="cartOverlay"></div>
    <div class="cart-drawer" id="cartDrawer">
        <div class="cart-header">
            <h2>Your Cart</h2>
            <button class="close-cart" id="closeCart"><i class="fas fa-times"></i></button>
        </div>
        <div class="shipping-progress-container">
            <p class="shipping-text" id="shippingText">You are $200 away from Free Shipping</p>
            <div class="shipping-bar-bg">
                <div class="shipping-bar-fill" id="shippingBar"></div>
            </div>
        </div>
        <div class="cart-items" id="cartItems"></div>
        <div class="cart-footer">
            <div class="cart-subtotal">
                <span>Subtotal</span>
                <span id="cartSubtotal">$0.00 AUD</span>
            </div>
            <p class="cart-taxes-note">Taxes and shipping calculated at checkout</p>
            <a href="../checkout.html" class="checkout-btn">Proceed to Checkout</a>
        </div>
    </div>
`;

function replaceBody(str, funcName, newBody) {
    const startIdx = str.indexOf('function ' + funcName);
    if (startIdx === -1) return str;
    let braceCount = 0;
    let inBrace = false;
    let startBraceIdx = -1;
    for (let i = startIdx; i < str.length; i++) {
        if (str[i] === '{') {
            if (!inBrace) startBraceIdx = i;
            inBrace = true;
            braceCount++;
        } else if (str[i] === '}') {
            braceCount--;
            if (braceCount === 0 && inBrace) {
                return str.substring(0, startIdx) + newBody + str.substring(i + 1);
            }
        }
    }
    return str;
}

const dir = './products';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let count = 0;

files.forEach(file => {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');

    // 1. Inject Cart HTML
    if (!content.includes('id="cartDrawer"')) {
        let footerMatches = [...content.matchAll(/<footer class=\"footer\">/g)];
        if (footerMatches.length > 0) {
             const footerIdx = footerMatches[footerMatches.length - 1].index;
             content = content.slice(0, footerIdx) + cartHtml + '\n    ' + content.slice(footerIdx);
        }
    }

    // 2. Replace addToCart
    content = replaceBody(content, 'addToCart()', `window.addToCart = function() {
            const name = document.querySelector('.product-page-title')?.textContent || document.querySelector('h1')?.textContent || '';
            const priceText = document.querySelector('.page-price')?.textContent || document.querySelector('#selectedPrice')?.textContent || '';
            const imgEl = document.getElementById('mainProductImg') || document.querySelector('.product-detail-photo');
            const imgPath = imgEl ? imgEl.getAttribute('src') : '';
            const qtyInput = document.getElementById('qtyInput');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            if(window.addToCartGlobal) window.addToCartGlobal(name, priceText, imgPath, qty);
        }`);

    // 3. Replace addToCartPage
    content = replaceBody(content, 'addToCartPage(name, price)', `window.addToCartPage = function(name, price) {
            const imgEl = document.querySelector('.product-detail-photo') || document.querySelector('#mainProductImg');
            const imgPath = imgEl ? imgEl.getAttribute('src') : '';
            const qtyInput = document.getElementById('qtyInput');
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            if(window.addToCartGlobal) window.addToCartGlobal(name, price, imgPath, qty);
        }`);

    fs.writeFileSync(p, content);
    count++;
});

console.log('Updated ' + count + ' files in /products.');
