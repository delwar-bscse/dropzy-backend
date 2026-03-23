import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import * as fs from 'fs';
import path from 'path';
import { IDimensionResponse } from "./dimensionFetcher.interface";
import config from "../../../config";
import { unlinkFiles } from "../../../shared/unlinkFile";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

const fetchDimensionsFromImages = async (imagePaths: string[]): Promise<IDimensionResponse> => {
    console.log("Images : ", imagePaths)
    if (!imagePaths || imagePaths.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please upload at least one image in the 'image' field");
    }

    try {
        // Use gemini-1.5-flash which is multimodal and very fast
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const imageParts = imagePaths.map((filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            let mimeType = "image/jpeg";
            if (ext === ".png") mimeType = "image/png";
            else if (ext === ".webp") mimeType = "image/webp";
            else if (ext === ".heic" || ext === ".heif") mimeType = "image/heic";
            const absolutePath = path.join(path.join(process.cwd(), 'uploads'), filePath);

            return {
                inlineData: {
                    data: Buffer.from(fs.readFileSync(absolutePath)).toString("base64"),
                    mimeType: mimeType,
                },
            };
        });

        const prompt = `
            Analyze the provided images of this product and estimate its physical dimensions (Length, Width, Height).
            Return the result strictly in JSON format with the following keys:
            - length (number)
            - width (number)
            - height (number)
            - unit (string, e.g., "cm")
            - description (string, a brief description of the product based on the images)

            If you cannot determine the dimensions accurately, provide your best estimate based on common sizes for such objects.
        `;

        const { response } = await model.generateContent([prompt, ...imageParts]);
        // const response = result.response;
        const text = response.text();

        // Clean the response text to ensure it's valid JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to parse dimensions from AI response");
        }

        const dimensions = JSON.parse(jsonMatch[0]) as IDimensionResponse;
        return dimensions;
    } catch (error: any) {
        console.error("Gemini Error Details:", error);

        let errorMessage = error?.message || "Error communicating with Gemini AI";

        if (error.status === 404) {
            errorMessage = "Gemini model not found (404). Please ensure your API key has access to 'gemini-1.5-flash' and your region is supported.";
        } else if (error.status === 401 || error.status === 403) {
            errorMessage = "Gemini API key is invalid or unauthorized (401/403).";
        }

        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage);
    } finally {
        // Delete images after processing (success or failure).
        imagePaths && await unlinkFiles(imagePaths);
    }
};

export const DimensionFetcherServices = {
    fetchDimensionsFromImages
};
