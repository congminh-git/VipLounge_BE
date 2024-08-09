import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Agency } from '../agency/agency.entity';

@Entity()
export class Lounge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column()
    agencyCode: string;

    @Column()
    airportCode: string;

    @ManyToOne(() => Agency, (agency) => agency.code)
    @JoinColumn({ name: 'agencyCode', referencedColumnName: 'code' })
    agency: Agency;
}
