import { BadRequestException, ValidationError } from "@nestjs/common";



export function validateExceptionFactory(errors: ValidationError[]){
    console.log('Validation Errors:', errors);
    const result = errors.map((error) => ({
        property: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
    }));
    return new BadRequestException(result);
}