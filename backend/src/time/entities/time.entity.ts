import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique} from 'typeorm';
import { Availability } from 'src/availability/entities/availability.entity';

@Entity()
// @Unique(["name", "planning"])
export class Time {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Availability, (availability) => availability.times)
    availability: Availability

    @Column()
    startTime: number

    @Column()
    endTime: number
}
