import { z } from "zod"
import { checkValidID } from "../../../shared/checkValidID"

export const createReportZodValidationSchema = z.object({
    body: z.object({
        provider: checkValidID("Provider Object ID is required"),
        reservation: checkValidID("Reservation Object ID is required"),
        reason: z.array(z.string({ required_error: 'Reason is required' }))
    })  
});