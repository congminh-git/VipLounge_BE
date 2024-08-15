import { RoleService } from './role.service';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    getListRole(): Promise<{
        data: import("./role.entity").Role[];
        status: number;
        message: string;
    }>;
    getRoleById(id: string): Promise<{
        data: import("./role.entity").Role;
        status: number;
        message: string;
    }>;
}
