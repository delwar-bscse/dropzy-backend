import e, { Request, Response } from 'express';
import Stripe from 'stripe';
import { handlePaymentSuccess } from '../handlers/handlePaymentSuccess';
import stripe from '../../config/stripe';
import config from '../../config';


const stripeWebhookPayment = async (req: Request, res: Response): Promise<any> => {
      console.log("Stripe Webhook called------------------------------------------------It's working");
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!payload) {
            return res.status(400).json({ error: 'Missing stripe payment payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing payment stripe-signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret_payment as string);
            const eventType: string = event.type;

            switch (eventType) {
                  case 'checkout.session.completed':
                        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
                        break;
                  default:
                        console.log(`⚠️ Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });
      } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({ error: `Webhook error: ${(error as Error).message}` });
      }
};


export default stripeWebhookPayment;