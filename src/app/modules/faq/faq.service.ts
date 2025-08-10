import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { FilterQuery } from 'mongoose';
import redis from '../../../config/redisClient';
import qs from 'qs';

const createFaqToDB = async (payload: IFaq): Promise<IFaq> => {

    const faq = await Faq.create(payload);
    if (!faq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created Faq');
    }

    const keys = await redis.smembers('faq:cacheKeys');
    if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del('faq:cacheKeys');
    }

    return faq;
};

const faqsFromDB = async (query: FilterQuery<any>): Promise<{ faqs: IFaq[], pagination: any }> => {


    const queryKey = qs.stringify(query, { addQueryPrefix: false, encode: false }); // e.g. "page=2&limit=10"
    const redisKey = `faq:${queryKey || 'default'}`;

    const cachedFaqs = await redis.get(redisKey);
    if (cachedFaqs) {
        return JSON.parse(cachedFaqs);
    }

    const FaqQuery = new QueryBuilder(
        Faq.find({}),
        query
    ).paginate();

    const [faqs, pagination] = await Promise.all([
        FaqQuery.queryModel,
        FaqQuery.getPaginationInfo()
    ]);

    await redis.set(redisKey, JSON.stringify({ faqs, pagination }), 'EX', 60 * 5);
    await redis.sadd('faq:cacheKeys', redisKey);

    return { faqs, pagination };
};

const deleteFaqToDB = async (id: string): Promise<IFaq | undefined> => {

    checkMongooseIDValidation(id, "Faq")

    await Faq.findByIdAndDelete(id);
    const keys = await redis.smembers('faq:cacheKeys');
    if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del('faq:cacheKeys');
    }
    return;
};

const updateFaqToDB = async (id: string, payload: IFaq): Promise<IFaq> => {

    checkMongooseIDValidation(id, "Faq")

    const updatedFaq = await Faq.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
    });

    if (!updatedFaq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to updated Faq');
    }

    const keys = await redis.smembers('faq:cacheKeys');
    if (keys.length > 0) {
        await redis.del(...keys); // Bulk delete
        await redis.del('faq:cacheKeys');
    }
    return updatedFaq;
};

export const FaqService = {
    createFaqToDB,
    updateFaqToDB,
    faqsFromDB,
    deleteFaqToDB,
};  