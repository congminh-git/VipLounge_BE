import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { Agency } from './agency.entity';

@Controller('agency')
export class AgencyController {
    constructor(private readonly agencyService: AgencyService) {}

    @Get()
    async getListAgency() {
        try {
            const result = await this.agencyService.getListAgency();
            return { data: result, status: 200, message: 'Successfully retrieved list of agencys.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                throw new HttpException(
                    'Failed to retrieve list agency. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get('serviceOptions')
    async getAgencyListServiceOptions(@Query('agency') agency) {
        try {
            const result = await this.agencyService.getAgencyListServiceOptions(agency);
            return { data: result, status: 200, message: 'Successfully retrieved list of agencys.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log(error);
                throw new HttpException(
                    'Failed to retrieve list agency. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getAgencyById(@Param('id') id: string) {
        const agencyId = parseInt(id, 10);
        try {
            const result = await this.agencyService.getAgencyById(agencyId);
            return { data: result, status: 200, message: 'Successfully retrieved agency.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve agency. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Post()
    async addAgency(@Body() agencyData: Agency) {
        try {
            const result = await this.agencyService.addAgency(agencyData.name, agencyData.code, agencyData.service);
            return { data: result, status: HttpStatus.CREATED, message: 'Agency added successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to add agency.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Put('update/:id')
    async updateAgency(@Body() agencyData: Agency, @Param('id') id: string) {
        try {
            const agencyId = parseInt(id, 10);
            const result = await this.agencyService.updateAgency(agencyData.name, agencyData.service, agencyId);
            return { data: result, status: HttpStatus.OK, message: 'Agency update successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to update agency.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Put('active/:id')
    async putActiveAgency(@Param('id') id: string) {
        try {
            const userId = parseInt(id, 10);
            const result = await this.agencyService.putActiveAgency(userId);
            return { data: result, status: HttpStatus.OK, message: 'Successfully' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to lock user.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Delete('/:id')
    async deleteAgency(@Param('id') id: string) {
        try {
            const agencyId = parseInt(id, 10);
            const result = await this.agencyService.deleteAgency(agencyId);
            return { data: result, status: HttpStatus.OK, message: 'Agency delete successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to delete agency.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
