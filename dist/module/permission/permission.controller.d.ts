import { PermissionService } from './permission.service';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    getListPermission(): Promise<{
        data: import("./permission.entity").Permission[];
        status: number;
        message: string;
    }>;
    getPermissionById(id: string): Promise<{
        data: import("./permission.entity").Permission;
        status: number;
        message: string;
    }>;
}
