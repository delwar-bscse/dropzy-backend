import mongoose from "mongoose";
import Stripe from "stripe";
import { UserModel } from "../../app/modules/user/user.model";
import stripe from "../../config/stripe";

export const handleStripeConnectedAccount = async (data: Stripe.Account) => {
  console.log("handleStripeConnectedAccount---------------Working")
  // console.log("handleStripeConnectedAccount---------------", data)

  const session = await mongoose.startSession();
  try {
    session.startTransaction()

    const email = data?.email

    if (!email) {
      throw new Error('Connected account email not found');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Connected account user not found')
    }

    const isAccountReady =
      data.details_submitted &&
      data.charges_enabled &&
      data.payouts_enabled &&
      !data.requirements?.disabled_reason;
      console.log("isAccountReady : ", isAccountReady)

    const loginUrl = await stripe.accounts.createLoginLink(data.id)

    await UserModel.findOneAndUpdate({ email }, { accountInfo: { accountId: data.id, accountUrl: loginUrl.url, status: isAccountReady } })

    await session.commitTransaction()
    await session.endSession()


  } catch (error) {
    session.abortTransaction()
    await session.endSession()
    console.log(error)
    return
  }
};