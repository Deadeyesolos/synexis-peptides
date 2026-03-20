const fs = require('fs');
const path = require('path');

const files = ['index.html', 'calculator.html', ...fs.readdirSync('./products').filter(f => f.endsWith('.html')).map(f => 'products/' + f)];
const navRegex = /<nav class="navbar" id="mainNav">[\s\S]*?<\/nav>\s*(?:<div class="mobile-nav">[\s\S]*?<\/div>)?/;
const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/;

let count = 0;
files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        let pathPrefix = f.includes('products/') ? '../' : '';

        const newNav = `
    <nav class="navbar" id="mainNav">
        <div class="nav-left">
            <a href="${pathPrefix}index.html#products" class="nav-link shop-link">Shop</a>
            <a href="${pathPrefix}index.html#best-sellers" class="nav-link">Best Sellers</a>
            <a href="${pathPrefix}index.html#categories" class="nav-link">Blends</a>
            <a href="${pathPrefix}calculator.html" class="nav-link">Calculator</a>
        </div>
        <div class="logo">
            <a href="${pathPrefix}index.html"><img src="${pathPrefix}Photos/logo.png" alt="Synexis Peptides" class="nav-logo"></a>
        </div>
        <div class="nav-right">
            <a href="${pathPrefix}coa.html" class="nav-link">Batch Testing</a>
            <a href="${pathPrefix}index.html#faq" class="nav-link">FAQs</a>
            <a href="${pathPrefix}index.html#contact" class="nav-link">Contact</a>
            <div class="nav-icons">
                <a href="#" class="icon-link cart-icon" title="Cart">
                    <i class="fas fa-shopping-bag"></i>
                    <span class="cart-count">0</span>
                </a>
            </div>
        </div>
        <button class="mobile-menu-btn" aria-label="Open menu"><i class="fas fa-bars"></i></button>
    </nav>
    <div class="mobile-nav">
        <a href="${pathPrefix}index.html" class="nav-link">Home</a>
        <a href="${pathPrefix}index.html#products" class="nav-link">Shop All</a>
        <a href="${pathPrefix}coa.html" class="nav-link">Batch Testing (COA)</a>
        <a href="${pathPrefix}calculator.html" class="nav-link">Calculator</a>
        <a href="${pathPrefix}index.html#faq" class="nav-link">FAQs</a>
        <a href="${pathPrefix}index.html#contact" class="nav-link">Contact</a>
    </div>`;

        const newFooter = `
    <footer class="footer">
        <div class="footer-grid">
            <div class="footer-col brand">
                <div class="footer-logo-img">
                    <img src="${pathPrefix}Photos/logo.png" alt="Synexis Peptides" class="footer-logo">
                </div>
                <p class="footer-brand-desc">Supplying research-grade peptides to Australian customers with transparent batch testing, fast dispatch, and a secure checkout experience.</p>
                <p class="footer-support-info">
                    Support: <a href="mailto:support@synexispeptides.com.au">support@synexispeptides.com.au</a><br>
                    Response: 24–48 business hours
                </p>
                <div class="socials">
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="Twitter / X"><i class="fab fa-x-twitter"></i></a>
                </div>
            </div>
            <div class="footer-col links">
                <h4>Shop</h4>
                <a href="${pathPrefix}index.html#products">All Peptides</a>
                <a href="${pathPrefix}index.html#best-sellers">Best Sellers</a>
                <a href="${pathPrefix}calculator.html">Peptide Calculator</a>
            </div>
            <div class="footer-col links">
                <h4>Support</h4>
                <a href="${pathPrefix}index.html#contact">Contact Us</a>
                <a href="${pathPrefix}index.html#faq">FAQs</a>
                <a href="${pathPrefix}coa.html">Batch Testing (COA)</a>
                <a href="#">Shipping Policy</a>
                <a href="#">Refund Policy</a>
            </div>
            <div class="footer-col secure">
                <h4>Secure Payments</h4>
                <div class="payment-icons">
                    <i class="fab fa-cc-visa"></i>
                    <i class="fab fa-cc-mastercard"></i>
                    <i class="fab fa-cc-amex"></i>
                    <i class="fab fa-bitcoin"></i>
                </div>
                <p class="footer-disclaimer-note">All products are sold for research purposes only. Not for human use.</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Synexis Peptides. All rights reserved.</p>
            <div class="footer-bottom-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Disclaimer</a>
            </div>
        </div>
    </footer>`;

        let updated = false;
        
        let newContent = content.replace(navRegex, newNav.trim() + '\n');
        if (newContent !== content) updated = true;
        
        newContent = newContent.replace(footerRegex, newFooter.trim() + '\n');
        if (newContent !== content) updated = true;

        if (updated) {
            fs.writeFileSync(f, newContent, 'utf8');
            count++;
        }
    } catch (e) { console.error('Error on', f, e.message); }
});

console.log('Updated nav/footer in ' + count + ' files.');
