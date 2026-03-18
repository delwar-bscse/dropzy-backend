"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStripeProduct = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const config_1 = __importDefault(require("../config"));
const updateStripeProduct = async (productId, payload) => {
    let interval = 'month';
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
    const price = await stripe_1.default.prices.create({
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
    const oldPrices = await stripe_1.default.prices.list({ product: productId, active: true });
    // deactivate current prices
    for (const oldPrice of oldPrices.data) {
        await stripe_1.default.prices.update(oldPrice.id, { active: false });
    }
    // Create a new payment link
    const paymentLink = await stripe_1.default.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${config_1.default.stripe.paymentSuccess}`,
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
exports.updateStripeProduct = updateStripeProduct;
