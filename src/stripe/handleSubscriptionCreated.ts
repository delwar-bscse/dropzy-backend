import Stripe from 'stripe';
import stripe from '../config/stripe';
import { User } from '../app/modules/user/user.model';
import { Plan } from '../app/modules/plan/plan.model';
import { Subscription } from '../app/modules/subscription/subscription.model';
import redis from '../config/redisClient';

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {

    try {

        // Retrieve subscription
        const subscription = await stripe.subscriptions.retrieve(data.id);

        // Retrieve customer
        const customer = (await stripe.customers.retrieve(
            subscription.customer as string
        )) as Stripe.Customer;

        // Extract priceId
        const productId = subscription.items.data[0]?.price?.product as string;

        // Retrieve invoice
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);

        const trxId = (invoice as any).payment_intent;
        const amountPaid = invoice?.total / 100;

        if (!customer?.email) {
            console.error("No email found for customer", customer.id);
            return { success: false, message: "No email for customer" };
        }

        const existingUser = await User.findOne({ email: customer.email });
        if (!existingUser) {
            console.error("User not found:", customer.email);
            return { success: false, message: "User not found" };
        }

        const plan = await Plan.findOne({ productId });
        if (!plan) {
            console.error("Plan not found:", productId);
            return { success: false, message: "Plan not found" };
        }

        const currentActiveSubscription = await Subscription.findOne({
            user: existingUser._id,
            status: "active",
        });

        // Get the current period start and end dates (Unix timestamps). Convert to human-readable date
        const currentPeriodStart = new Date((subscription as any).current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

        // Create new subscription
        const newSubscription = new Subscription({
            user: existingUser._id,
            customerId: customer.id,
            plan: plan._id,
            price: amountPaid,
            subscriptionId: data.id,
            trxId,
            currentPeriodStart,
            currentPeriodEnd,
        });

        if (currentActiveSubscription) {
            await Subscription.findOneAndUpdate(
                {
                    user: existingUser._id,
                },
                {
                    plan: plan._id,
                    price: amountPaid,
                    subscriptionId: data.id,
                    trxId,
                    currentPeriodStart,
                    currentPeriodEnd,
                },
                { new: true }
            );
            await redis.del(`subscription:${existingUser._id}`);
            return { success: true };
        } else {
            await newSubscription.save();
            // Update user
            await User.findByIdAndUpdate(existingUser._id, {
                isSubscribed: true,
                hasAccess: true,
            });
            await redis.del(`subscription:${existingUser._id}`);
            return { success: true };
        }
    } catch (error) {
        console.error("handleSubscriptionCreated error:", error);
        return { success: false, error: (error as Error).message };
    }
};
