import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

export type Service = 'lounge' | 'connecting_flight';

@Entity()
export class Agency {
    @PrimaryColumn()
    key: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column()
    service: Service;

    @Column()
    airportCode: string;

    @Column()
    status: number = 0;
}
