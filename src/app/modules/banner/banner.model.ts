import { model, Schema } from "mongoose";
import { BannerModel, IBanner } from "./banner.interface";
import config from "../../../config";

const bannerSchema = new Schema<IBanner, BannerModel>(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

bannerSchema.post("find", function (banners: IBanner[]) {

    banners.forEach((banner: IBanner) => {
        if (banner.image) {
            banner.image = `http://${config.ip_address}:${config.port}${banner.image}`;
        }
    });

})

export const Banner = model<IBanner, BannerModel>("Banner", bannerSchema);