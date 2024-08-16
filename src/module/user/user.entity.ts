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

    @Column({ nullable: true })
    passwordVerificationCode: string;

    @Column({ nullable: true })
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

    @Column({ default: 0 })
    status: number;

    @Column({ default: 0 })
    failLoginCount: number;

    @ManyToOne(() => Agency, (agency) => agency.code, { nullable: true })
    @JoinColumn({ name: 'agencyCode', referencedColumnName: 'code' })
    agency?: Agency;
}
