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

    // Determine the base URL dynamically
    const origin = req.headers.origin || 'https://synexispeptides.com.au';

    // Create line items for Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          images: [item.image.startsWith('http') ? item.image : `${origin}/${item.image.replace(/^\.\.\//, '')}`],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
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
      success_url: `${origin}/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-failed.html`,
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Session Error:', err);
    res.status(500).json({ error: err.message });
  }
};
