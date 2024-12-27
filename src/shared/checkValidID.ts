import { z } from "zod";
import mongoose from "mongoose";

export const checkValidID = (value: string) =>
    z.string({ required_error: `${value}` }).refine((val) => {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(val);
        return isValidObjectId;
    }, {
        message: `Invalid ${value} format`,
    });
