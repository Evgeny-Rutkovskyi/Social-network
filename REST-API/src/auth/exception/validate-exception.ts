import { BadRequestException, ValidationError } from "@nestjs/common";



export function validateExceptionFactory(errors: ValidationError[]){
    const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
    }));
    return new BadRequestException(result);
}