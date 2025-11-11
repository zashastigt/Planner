import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Planning {
    @PrimaryColumn()
    planningId: string

    @Column()
    startDate: number

    @Column()
    endDate: number

    @Column({
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP"
    })
    creationDate: number
}
