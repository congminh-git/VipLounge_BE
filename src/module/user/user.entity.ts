import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agency } from '../agency/agency.entity';
import { Role } from '../role/role.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    passwordVerificationCode: string;

    @Column()
    verificationCodeExpiry: string;

    @Column()
    passwordExpiryDate: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column()
    service: string;

    @Column({ nullable: true })
    agencyCode: string;

    @Column()
    roleName: string;

    @Column({ type: 'text' })
    permissions: string;

    @Column()
    status: number;

    @Column()
    failLoginCount: number;

    @ManyToOne(() => Agency, (agency) => agency.code, { nullable: true })
    @JoinColumn({ name: 'agencyCode', referencedColumnName: 'code' })
    agency?: Agency;
}
