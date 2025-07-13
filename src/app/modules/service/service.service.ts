import { StatusCodes } from "http-status-codes";
import { IService } from "./service.interface";
import { Service } from "./service.model";
import { FilterQuery } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import unlinkFile from "../../../shared/unlinkFile";
import QueryBuilder from "../../../helpers/QueryBuilder";
import { checkMongooseIDValidation } from "../../../shared/checkMongooseIDValidation";
import ApiError from "../../../errors/ApiErrors";

const createServiceToDB = async (payload: IService): Promise<IService> => {

    const result = await Service.create(payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create service");
    }

    return result;
};

const updateServiceToDB = async (id: string, payload: IService): Promise<IService> => {

    checkMongooseIDValidation(id, "Service");

    const isExistService = await Service.findById(id).lean().exec();

    if (isExistService?.image?.startsWith("/images")) {
        unlinkFile(isExistService.image as string);
    }

    const result = await Service.findByIdAndUpdate(
        { _id: id },
        payload,
        { new: true }
    );

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Update Service")
    }

    return result;
}

const retrievedServiceDetailsFromDB = async (id: string): Promise<IService | null> => {

    checkMongooseIDValidation(id, "Service");

    const service = await Service.findById(id).lean().exec();

    return service;
}

const retrieveServiceFromDB = async (user: JwtPayload, query: FilterQuery<IService>): Promise<{services: IService[], pagination: any}> => {

    const ServiceQuery = new QueryBuilder(
        Service.find({ author: user.id }).lean().exec(),
        query
    ).paginate();

    const [services, pagination] = await Promise.all([
        ServiceQuery.queryModel.populate("category", "name"),
        ServiceQuery.getPaginationInfo()
    ]);

    return { services, pagination };
}

const retrieveAllServiceFromDB = async (query: FilterQuery<IService>): Promise<{services: IService[], pagination: any}> => {

    const ServiceQuery = new QueryBuilder(
        Service.find().lean().exec(),
        query
    ).paginate();

    const [services, pagination] = await Promise.all([
        ServiceQuery.queryModel.populate("category", "name"),
        ServiceQuery.getPaginationInfo()
    ]);

    return { services, pagination };
}

const deleteServiceFromDB = async (user: JwtPayload, id: string): Promise<IService> => {

    checkMongooseIDValidation(id, "Service");

    const isExistService = await Service.findOne({author: user.id}).lean().exec();
    if (!isExistService) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to delete this service");
    }

    const result = await Service.findByIdAndUpdate(
        { _id: id },
        { status: "Inactive" },
        { new: true }
    );

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete service");
    }

    return result;
}

export const ServiceService = {
    createServiceToDB,
    updateServiceToDB,
    retrieveServiceFromDB,
    retrieveAllServiceFromDB,
    deleteServiceFromDB,
    retrievedServiceDetailsFromDB
}