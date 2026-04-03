import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.secret_key as string, {
    apiVersion: '2025-08-27.basil',
});

export default stripe;


/*
Need to setup below steps to get stripe webhook locally

******************* Windows PowerShell *******************
winget install Stripe.StripeCLI

// login stripe account
stripe login

// create webhook
stripe listen --forward-to http://10.10.7.26:5000/api/v1/stripe/webhook
stripe listen --forward-to http://10.10.7.26:5000/api/v1/stripe/webhook/make-payment
stripe listen   --forward-to http://10.10.7.26:5000/api/v1/stripe/webhook/connected-account   --events account.updated,account.application.deauthorized

// instant payment test card
4000 0000 0000 0077
*/