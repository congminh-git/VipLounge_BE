import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) {}

    @Get()
    async getListService() {
        try {
            const result = await this.serviceService.getListService();
            return { data: result, status: 200, message: 'Successfully retrieved list of services.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve list service. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getServiceById(@Param('id') id: string) {
        const serviceId = parseInt(id, 10);
        try {
            const result = await this.serviceService.getServiceById(serviceId);
            return { data: result, status: 200, message: 'Successfully retrieved service.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve service. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
