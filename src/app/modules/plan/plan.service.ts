import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPlan } from "./plan.interface";
import { Plan } from "./plan.model";
import mongoose from "mongoose";
import stripe from "../../../config/stripe";
import { createStripeProductCatalog } from "../../../stripe/createStripeProductCatalog";

const createPlanToDB = async(payload: IPlan): Promise<IPlan | null>=>{

    const productPayload = {
        title: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),   
    }

    const product = await createStripeProductCatalog(productPayload);
    

    if(!product){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product")
    }

    if(product){
        payload.paymentLink = product.paymentLink
        payload.productId = product.productId
    }

    const result = await Plan.create(payload);
    if(!result){
        await stripe.products.del(product.productId);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to created Plan")
    }

    return result;
}

const updatePlanToDB = async(id: string, payload: IPlan): Promise<IPlan | null>=>{

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findByIdAndUpdate(
        {_id: id},
        payload,
        { new: true } 
    );

    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Update Plan")
    }

    return result;
}


const retrievedPlanFromDB = async(paymentType: string): Promise<IPlan[]>=>{

    const query:any = {
        status: "Active"
    }
    if(paymentType){
        query.paymentType = paymentType
    }

    const result = await Plan.find(query).lean().exec();
    return result;
}

const retrievedPlanDetailsFromDB = async(id: string): Promise<IPlan | null>=>{

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findById(id).lean().exec();

    return result;
}

const deletePlanToDB = async(id: string): Promise<IPlan | null>=>{
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Plan.findByIdAndUpdate(
        {_id: id},
        {status: "Delete"},
        {new: true}
    );

    if(!result){
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