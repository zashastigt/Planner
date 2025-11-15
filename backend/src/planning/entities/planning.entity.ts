import { Availability } from 'src/availability/entities/availability.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity()
export class Planning {
    @PrimaryColumn()
    id: string

    @Column()
    startDate: number

    @Column()
    endDate: number

    @Column({
        type: "timestamp", 
        default: () => "CURRENT_TIMESTAMP"
    })
    creationDate: number

    @OneToMany(()=> Availability, (availabililty) => availabililty.planning)
    availability: Availability[]
}
