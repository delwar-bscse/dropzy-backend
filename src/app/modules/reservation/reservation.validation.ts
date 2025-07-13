import { z } from 'zod';
import { checkValidID } from '../../../shared/checkValidID';

export const reservationZodValidationSchema = z.object({
    body: z.object({
        service : checkValidID("Service Object ID is required")
    })
});