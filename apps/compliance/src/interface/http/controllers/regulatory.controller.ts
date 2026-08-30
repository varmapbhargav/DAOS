import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('regulatory')
@ApiTags('Regulatory')
@ApiBearerAuth()
export class RegulatoryController {
  @Get('filings')
  async listFilings() {
    return [];
  }

  @Post('filings')
  async createFiling(@Body() body: any) {
    return { id: '1' };
  }
}
