import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique, OneToMany} from 'typeorm';
import { Planning } from 'src/planning/entities/planning.entity';
import { Time } from 'src/time/entities/time.entity';

@Entity()
@Unique(["name", "planning"])
export class Availability {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Planning, (planning) => planning.availability, {
        onDelete: "CASCADE"
    })
    planning: Planning

    @Column()
    name: string

    @OneToMany(() => Time, (time) => time.availability)
    times: Time[]
}
