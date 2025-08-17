import Stripe from 'stripe';
import stripe from '../config/stripe';
import { User } from '../app/modules/user/user.model';
import redis from '../config/redisClient';

export const handleConnectedAccount = async (data: Stripe.Account) => {

    try {

        // Find the user by Stripe account ID
        const existingUser = await User.findOne({ 'stripeAccountInfo.stripeAccountId': data.id });

        if (!existingUser) {
            console.log(`User not found for account ID: ${data.id}`)
            return { success: false };
        }

        // Check if the onboarding is complete
        if (data.charges_enabled) {
            const loginLink = await stripe.accounts.createLoginLink(data.id);

            // Save Stripe account information to the user record
            await User.findByIdAndUpdate(existingUser?._id, {
                stripeAccountInfo: {
                    stripeAccountId: data.id,
                    status: true,
                    externalAccountId: data.external_accounts?.data[0]?.id,
                    currency: data.default_currency,
                    accountUrl: loginLink.url
                }
            });
            await redis.del(`user:${existingUser._id}`);
            return { success: true };
        }

        return { success: false };

    } catch (error) {
        console.error("handleConnectedAccount error:", error);
        return { success: false };
    }
}