import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('compliance')
@ApiTags('Compliance')
@ApiBearerAuth()
export class ComplianceController {
  @Get('status')
  @ApiOperation({ summary: 'Get compliance status for an action' })
  async getStatus(@Query('action') action: string, @Query('investorId') investorId: string) {
    return { compliant: true, violations: [] };
  }
}
