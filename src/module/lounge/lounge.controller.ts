import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { LoungeService } from './lounge.service';
import { Lounge } from './lounge.entity';

@Controller('lounge')
export class LoungeController {
    constructor(private readonly loungeService: LoungeService) {}

    @Get()
    async getListLounge() {
        try {
            const result = await this.loungeService.getListLounge();
            return { data: result, status: 200, message: 'Successfully retrieved list of lounges.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve list lounge. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getLoungeById(@Param('id') id: string) {
        const loungeId = parseInt(id, 10);
        try {
            const result = await this.loungeService.getLoungeById(loungeId);
            return { data: result, status: 200, message: 'Successfully retrieved lounge.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve lounge. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Post()
    async addLounge(@Body() loungeData: Lounge) {
        try {
            const result = await this.loungeService.addLounge(
                loungeData.name,
                loungeData.code,
                loungeData.agencyCode,
                loungeData.airportCode,
            );
            return { data: result, status: HttpStatus.CREATED, message: 'Lounge added successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to add lounge.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Put('update/:id')
    async updateLounge(@Body() loungeData: Lounge, @Param('id') id: string) {
        try {
            const loungeId = parseInt(id, 10);
            const result = await this.loungeService.updateLounge(
                loungeData.name,
                loungeData.agencyCode,
                loungeData.airportCode,
                loungeId,
            );
            return { data: result, status: HttpStatus.OK, message: 'Lounge update successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to update lounge.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Delete('/:id')
    async deleteLounge(@Param('id') id: string) {
        try {
            const loungeId = parseInt(id, 10);
            const result = await this.loungeService.deleteLounge(loungeId);
            return { data: result, status: HttpStatus.OK, message: 'Lounge delete successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to delete lounge.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
