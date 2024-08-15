import { Repository } from 'typeorm';
import { Role } from './role.entity';
export declare class RoleService {
    private roleRepository;
    constructor(roleRepository: Repository<Role>);
    getListRole(): Promise<Role[]>;
    getRoleById(roleName: number): Promise<Role>;
}
