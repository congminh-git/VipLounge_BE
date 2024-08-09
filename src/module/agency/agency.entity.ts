import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { Lounge } from '../lounge/lounge.entity';
import { CFRom } from '../cfRom/cfRom.entity';

export type Service = 'lounge' | 'connecting_flight' | 'master';

@Entity()
export class Agency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column()
    service: Service;

    @Column()
    status: number = 0;

    @OneToMany(() => Lounge, (lounge) => lounge.agency)
    lounges: Lounge[];

    @OneToMany(() => CFRom, (cfrom) => cfrom.agency)
    cfroms: CFRom[];
}
