import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { CFRomService } from './cfRom.service';
import { CFRom } from './cfRom.entity';

@Controller('cf-rom')
export class CFRomController {
    constructor(private readonly cfRomService: CFRomService) {}

    @Get()
    async getListCFRom() {
        try {
            const result = await this.cfRomService.getListCFRom();
            return { data: result, status: 200, message: 'Successfully retrieved list of connecting flight rooms.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve list connecting flight room. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Get(':id')
    async getCFRomById(@Param('id') id: string) {
        const cfRomId = parseInt(id, 10);
        try {
            const result = await this.cfRomService.getCFRomById(cfRomId);
            return { data: result, status: 200, message: 'Successfully retrieved connecting flight room.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Failed to retrieve connecting flight room. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    @Post()
    async addCFRom(@Body() cfRomData: CFRom) {
        try {
            const result = await this.cfRomService.addCFRom(
                cfRomData.name,
                cfRomData.code,
                cfRomData.agencyCode,
                cfRomData.airportCode,
            );
            return { data: result, status: HttpStatus.CREATED, message: 'Connecting flight room added successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to add connecting flight room.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Put('update/:id')
    async updateCFRom(@Body() cfRomData: CFRom, @Param('id') id: string) {
        try {
            const cfRomId = parseInt(id, 10);
            const result = await this.cfRomService.updateCFRom(
                cfRomData.name,
                cfRomData.agencyCode,
                cfRomData.airportCode,
                cfRomId,
            );
            return { data: result, status: HttpStatus.OK, message: 'Connecting flight room update successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to update connecting flight room.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Delete('/:id')
    async deleteCFRom(@Param('id') id: string) {
        try {
            const cfRomId = parseInt(id, 10);
            const result = await this.cfRomService.deleteCFRom(cfRomId);
            return { data: result, status: HttpStatus.OK, message: 'Connecting flight room delete successfully.' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Failed to delete connecting flight room.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
