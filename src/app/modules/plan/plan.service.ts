import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPlan } from "./plan.interface";
import { Plan } from "./plan.model";
import mongoose, { FilterQuery } from "mongoose";
import stripe from "../../../config/stripe";
import { createStripeProductCatalog } from "../../../stripe/createStripeProductCatalog";
import QueryBuilder from "../../../helpers/QueryBuilder";

const createPlanToDB = async (payload: IPlan): Promise<IPlan | null> => {

    const productPayload = {
        title: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),
    }

    const product = await createStripeProductCatalog(productPayload);


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

    return result;
}

const updatePlanToDB = async (id: string, payload: IPlan): Promise<IPlan | null> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findByIdAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Update Plan")
    }

    return result;
}


const retrievedPlanFromDB = async (query: FilterQuery<IPlan>): Promise<IPlan[]> => {

    const PlanQuery = new QueryBuilder(
        Plan.find({ status: "Active" }).lean().exec(),
        query
    ).paginate().filter();

    const plans = await PlanQuery.queryModel;
    return plans;
}

const retrievedPlanDetailsFromDB = async (id: string): Promise<IPlan | null> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findById(id).lean().exec();

    return result;
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

    return result;
}

export const PlanService = {
    createPlanToDB,
    updatePlanToDB,
    retrievedPlanFromDB,
    retrievedPlanDetailsFromDB,
    deletePlanToDB
}