import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPlan } from "./plan.interface";
import { Plan } from "./plan.model";
import mongoose, { FilterQuery } from "mongoose";
import stripe from "../../../config/stripe";
import { createStripeProduct } from "../../../stripe/createStripeProduct";
import redis from "../../../config/redisClient";
import { updateStripeProduct } from "../../../stripe/updateStripeProduct";
import { deleteStripeProduct } from "../../../stripe/deleteStripeProduct";

const createPlanToDB = async (payload: IPlan): Promise<IPlan | null> => {

    const productPayload = {
        title: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),
    }

    const product = await createStripeProduct(productPayload);


    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product")
    }

    if (product) {
        payload.paymentLink = product.paymentLink
        payload.productId = product.productId
    }

    const result = await Plan.create(payload);
    if (!result) {
        await stripe.products.del(product.productId);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Plan")
    }

    await redis.del(`plan`);

    return result;
}

const updatePlanToDB = async (id: string, payload: IPlan): Promise<IPlan | null> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const plan = await Plan.findById(id).lean().exec();
    if(!plan){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }


    if(payload?.price && payload?.duration){
        const productPayload = {
            duration: payload.duration,
            price: Number(payload.price),
        }
        const updateProduct = await updateStripeProduct(plan?.productId as string, productPayload);
        if(!updateProduct){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created updated payment link")
        }

        payload.paymentLink = updateProduct

    }

    const result = await Plan.findByIdAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Update Plan")
    }
    await redis.del(`plan`);

    return result;
}


const retrievedPlanFromDB = async (query: FilterQuery<IPlan>): Promise<IPlan[]> => {

    const cachedPlans = await redis.get(`plan`);
    if (cachedPlans) {
        return JSON.parse(cachedPlans);
    }

    const plans = await Plan.find({ status: "Active" }).lean().exec();

    if(plans?.length > 0){
        await redis.set(`plan`, JSON.stringify(plans), 'EX', 60 * 30);
    }
    return plans;
}

const deletePlanToDB = async (id: string): Promise<IPlan | null> => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findByIdAndUpdate(
        { _id: id },
        { status: "Delete" },
        { new: true }
    );

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to deleted Package")
    }

    await deleteStripeProduct(result?.productId as string);
    await redis.del(`plan`);
    return result;
}

export const PlanService = {
    createPlanToDB,
    updatePlanToDB,
    retrievedPlanFromDB,
    deletePlanToDB
}