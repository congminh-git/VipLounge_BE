import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class History {
    @PrimaryColumn()
    transactionKey: string;

    @Column()
    passengerName: string;

    @Column()
    pnr: string;

    @Column()
    departureTime: string;

    @Column()
    flightCode: string;

    @Column()
    checkTime: string;

    @Column()
    user: string;

    @Column()
    agencyCode: string;

    @Column()
    airportCode: string;

    @Column()
    service: string;
}
