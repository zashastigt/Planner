import { Planning } from "src/planning/entities/planning.entity"
import { IsNotEmpty } from "class-validator"
import { Time } from "src/time/entities/time.entity"

export class CreateAvailabilityDto {

    planning: Planning

    @IsNotEmpty()
    name: string
    
    @IsNotEmpty()
    times: Time[]

}
