import { IsNotEmpty, IsOptional } from "class-validator"

export class CreatePlanningDto {
    id: string
    
    @IsNotEmpty()
    startDate: number

    @IsNotEmpty()
    endDate: number

    @IsOptional()
    webhook: string
}
