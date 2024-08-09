import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    roleName: string;

    @Column({ type: 'text' })
    permissions: string;

    @OneToMany(() => User, (user) => user.roleName)
    users: User[];
}
