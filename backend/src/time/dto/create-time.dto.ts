import { isNotEmpty, IsNotEmpty } from "class-validator";
import { Availability } from "src/availability/entities/availability.entity";

export class CreateTimeDto {

    @IsNotEmpty()
    availability: Availability

    @IsNotEmpty()
    startTime: number
    
    @IsNotEmpty()
    endTime: number
    
}
