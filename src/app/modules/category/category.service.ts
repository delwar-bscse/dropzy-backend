import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiErrors'
import { ICategory } from './category.interface'
import { Category } from './category.model'
import unlinkFile from '../../../shared/unlinkFile'
import redis from '../../../config/redisClient'

const createCategoryToDB = async (payload: ICategory) => {
    const isExistCategory = await Category.findOne({ name: payload.name })

    if (isExistCategory) {
        unlinkFile(payload.image);
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "This Category Name Already Exist");
    }

    const category = await Category.create(payload);

    if (!category) {
        unlinkFile(payload.image);
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Category')
    }

    await redis.del(`category`);
    return category;

}

const retrieveCategoriesFromDB = async (): Promise<ICategory[]> => {

    const cachedCategories = await redis.get(`category`);
    if (cachedCategories) {
        return JSON.parse(cachedCategories);
    }
    const result = await Category.find({});

    // Cache user in Redis for future requests
    await redis.set(`category`, JSON.stringify(result), 'EX', 60 * 5);
    return result;
}

const updateCategoryToDB = async (id: string, payload: ICategory) => {
    const isExistCategory = await Category.findById(id);

    if (!isExistCategory) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
    }

    if (payload.image) {
        unlinkFile(isExistCategory?.image);
    }

    const updateCategory = await Category.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true }
    )

    await redis.del(`category`);
    return updateCategory
}

const deleteCategoryToDB = async (id: string): Promise<ICategory | null> => {

    const deleteCategory = await Category.findByIdAndDelete(id);

    if (!deleteCategory) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist")
    }
    await redis.del(`category`);
    return deleteCategory
}

export const CategoryService = {
    createCategoryToDB,
    retrieveCategoriesFromDB,
    updateCategoryToDB,
    deleteCategoryToDB
}