import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { FilterQuery } from 'mongoose';
import redis from '../../../config/redisClient';
import qs from 'qs';
import { clearFaqCache } from './faq.util';

const createFaqToDB = async (payload: IFaq): Promise<IFaq> => {

    const faq = await Faq.create(payload);
    if (!faq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created Faq');
    }

    clearFaqCache(redis);
    return faq;
};

const faqsFromDB = async (query: FilterQuery<any>): Promise<{ faqs: IFaq[], pagination: any }> => {

    const allowedParams = ["page", "limit"];
    const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([key]) => allowedParams.includes(key))
    );

    // const queryKey = qs.stringify(filteredQuery, { addQueryPrefix: false, encode: false });
    const queryKey = qs.stringify(filteredQuery, { encode: false }) || 'default';
    const redisKey = `faq:${queryKey}`;

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

    // Tiered TTL ( popular page getting time for cache )
    const ttl = filteredQuery.page === 1 ? 60 * 10 : 60 * 3;

    // 5. Cache only if data is useful
    if (faqs.length > 0) {
        await redis.set(redisKey, JSON.stringify({ faqs, pagination }), "EX", ttl);
        await redis.sadd("faq:cacheKeys", redisKey);
    }

    return { faqs, pagination };
};

const deleteFaqToDB = async (id: string): Promise<IFaq | undefined> => {

    checkMongooseIDValidation(id, "Faq")

    const feq = await Faq.findByIdAndDelete(id);

    if( !feq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Faq');
    }

    clearFaqCache(redis);
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

    clearFaqCache(redis);
    return updatedFaq;
};

export const FaqService = {
    createFaqToDB,
    updateFaqToDB,
    faqsFromDB,
    deleteFaqToDB,
};  