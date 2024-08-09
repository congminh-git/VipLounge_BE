import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) {}

    async getListPermission(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async getPermissionById(permissionId: number): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        return permission;
    }
}
