import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get email from query string
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Get Stripe secret key from environment variable
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // Calculate date 30 days ago
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

    // Search for successful charges matching the email
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: thirtyDaysAgo,
      },
    });

    // Filter charges by email and successful status
    const matchingCharges = charges.data.filter(
      (charge) =>
        charge.billing_details?.email?.toLowerCase() === email.toLowerCase() &&
        charge.status === 'succeeded' &&
        charge.paid === true
    );

    // Return result
    if (matchingCharges.length > 0) {
      return res.status(200).json({ paid: true });
    } else {
      return res.status(200).json({ paid: false });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      paid: false 
    });
  }
}
