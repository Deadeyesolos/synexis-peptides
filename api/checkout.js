const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, email, shipping } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Determine the base URL robustly
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const origin = req.headers.origin || `${protocol}://${host}`;

    console.log('Checkout Origin:', origin);

    // Create line items for Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          // Images must be absolute and publicly accessible. 
          // We'll skip them if they look like relative paths to avoid "Invalid URL" errors during testing.
          images: item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.qty,
    }));


    // Add shipping as a line item if applicable
    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Express Shipping (Australia Post)',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AU'], 
      },
      allow_promotion_codes: true,
      metadata: {
        order_type: 'research_use_only',
        cart_summary: items.map(i => `${i.qty}x ${i.name}`).join(', ').substring(0, 500)
      },
      success_url: `${origin}/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancelled.html`,
    });


    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Session Error:', err);
    res.status(500).json({ error: err.message });
  }
};
