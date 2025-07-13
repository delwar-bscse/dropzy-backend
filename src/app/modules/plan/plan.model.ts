import { model, Schema } from "mongoose";
import { IPlan, PlanModel } from "./plan.interface";

const PlanSchema = new Schema<IPlan, PlanModel>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        duration: {
            type: String,
            enum: ['1 month' , '3 months' , '6 months' , '1 year'],
            required: true
        },
        paymentType: {
            type: String,
            enum: ['Monthly' , 'Yearly'],
            required: true
        },
        productId: {
            type: String,
            required: true
        },
        paymentLink: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Delete'],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
)

PlanSchema.index({ paymentType: 1 });
PlanSchema.index({ status: 1 });
PlanSchema.index({ duration: 1 });

export const Plan = model<IPlan, PlanModel>("Plan", PlanSchema)