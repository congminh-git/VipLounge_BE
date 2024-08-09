import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) {}

    async getListRole(): Promise<Role[]> {
        return this.roleRepository.find();
    }

    async getRoleById(roleName: number): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id: roleName } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }
}
