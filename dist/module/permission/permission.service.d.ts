import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
export declare class PermissionService {
    private permissionRepository;
    constructor(permissionRepository: Repository<Permission>);
    getListPermission(): Promise<Permission[]>;
    getPermissionById(permissionId: number): Promise<Permission>;
}
