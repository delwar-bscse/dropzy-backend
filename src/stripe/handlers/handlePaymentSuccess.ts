import Stripe from "stripe";
import { UserModel } from "../../app/modules/user/user.model";
import { USER_ROLES } from "../../enums/user";
import { ParcelModel } from "../../app/modules/parcel/parcel.model";
import { PaymentStatus } from "../../enums/parcel";
import ApiError from "../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";



export const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
  console.log("Payment Successful...........handlePaymentSuccess")
  const { metadata } = session;

  // Test Payment - For Super Admin
  if (metadata?.paymentType === 'testPayment') {
    console.log("Test Payment : ", metadata)
    return;
  }

  // Change parcel payment status after successful payment
  if (metadata?.paymentType === 'parcelPostPayment') {
    const booking = await ParcelModel.findByIdAndUpdate(metadata?.parcel, {
      $set: { paymentStatus: PaymentStatus.PAID },
    });
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'After payment - Failed to update parcel payment status');
    }
  }

  return;
};