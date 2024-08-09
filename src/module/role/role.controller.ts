import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    async getListRole() {
        try {
            const result = await this.roleService.getListRole();
            return { data: result, status: 200, message: 'Successfully retrieved list of roles.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve list role. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getRoleById(@Param('id') id: string) {
        const roleName = parseInt(id, 10);
        try {
            const result = await this.roleService.getRoleById(roleName);
            return { data: result, status: 200, message: 'Successfully retrieved role.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve role. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
