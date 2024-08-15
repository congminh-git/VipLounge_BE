import { User } from '../user/user.entity';
export declare class Role {
    id: number;
    roleName: string;
    permissions: string;
    users: User[];
}
