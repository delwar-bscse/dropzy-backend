import { model, Schema } from "mongoose";
import { IService, ServiceModel } from "./service.interface";
import config from "../../../config";

const serviceSchema = new Schema<IService, ServiceModel>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            immutable: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            immutable: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        rating: {
            type: Number,
            default: 0
        },
        totalRating: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
)

serviceSchema.index({ author: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ rating: 1 });


serviceSchema.post("find", function (services: IService[]) {

    services.forEach((service: IService) => {
        if (service.image && !service.image.startsWith('http')) {
            service.image = `http://${config.ip_address}:${config.port}${service.image}`;
        }
    })

})

serviceSchema.post("findOne", function (service: IService) {

    if (service.image && !service.image.startsWith('http')) {
        service.image = `http://${config.ip_address}:${config.port}${service.image}`;
    }
})

export const Service = model<IService, ServiceModel>("Service", serviceSchema)