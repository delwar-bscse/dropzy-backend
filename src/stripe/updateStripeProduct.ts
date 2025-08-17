import stripe from "../config/stripe";
import config from "../config";

export const updateStripeProduct = async ( productId: string, payload:any ): Promise<string | null> => {
    
    let interval: 'month' | 'year' = 'month'; 
    let intervalCount = 1;

    // map duration to interval_count
    switch (payload.duration) {
        case '1 month':
            interval = 'month';
            intervalCount = 1;
            break;
        case '3 months':
            interval = 'month';
            intervalCount = 3;
            break;
        case '6 months':
            interval = 'month';
            intervalCount = 6;
            break;
        case '1 year':
            interval = 'year';
            intervalCount = 1;
            break;
        default:
            interval = 'month';
            intervalCount = 1;
    }

    // Create a new price for the existing product
    const price = await stripe.prices.create({
        product: productId,
        unit_amount: payload.price && payload.price * 100,
        currency: 'usd',
        recurring: { interval, interval_count: intervalCount },
    });

    // if failed to create new price
    if (!price) {
        console.log("Failed to create new price");
        return null;
    }

    // retrieved current prices;
    const oldPrices = await stripe.prices.list({ product: productId, active: true });

    // deactivate current prices
    for (const oldPrice of oldPrices.data) {
        await stripe.prices.update(oldPrice.id, { active: false });
    }

    // Create a new payment link
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${config.stripe.paymentSuccess}`,
            },
        },
        metadata: {
            productId: productId,
        },
    });

    // if failed to create payment link
    if (!paymentLink.url) {
        console.log("Failed to create new payment link");
        return null;
    }

    return paymentLink.url;
};