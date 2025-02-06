import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { RegistrationUserDto } from "../dto/registration.dto";



export class DtoUserInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next
            .handle()
            .pipe(
                map((data) => {
                    if(typeof data == 'object'){
                        return this.deleteProperty(data);
                    }
                })
            );
    }

    deleteProperty(obj: RegistrationUserDto){
        const {password, ...anotherProperty} = obj;
        return anotherProperty;
    }

}