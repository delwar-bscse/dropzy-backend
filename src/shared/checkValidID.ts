import { z } from "zod";
import mongoose from "mongoose";

export const checkValidID = (value: string) =>
    z.string({ required_error: `${value} is required` }).refine((val) => {
        
        const isValidObjectId = mongoose.Types.ObjectId.isValid(val);
        const matchesPattern = /^[a-fA-F0-9]{24}$/.test(val);
        return isValidObjectId && matchesPattern;
        
    }, {
        message: `Invalid ${value} format`,
    });
