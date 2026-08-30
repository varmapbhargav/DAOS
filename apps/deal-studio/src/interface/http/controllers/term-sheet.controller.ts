import { NotFoundError, TenantContextHolder, TenantId, TermSheetId } from '@daos/shared-kernel';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { TERM_SHEET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { TermSheetRepository } from '../../../domain/repositories/term-sheet.repository';
import { TermSheetDto, toTermSheetDto } from '../../../application/deal.mapper';

@ApiTags('term-sheets')
@Controller('term-sheets')
export class TermSheetController {
  constructor(
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a term sheet by id' })
  async get(@Param('id') id: string): Promise<TermSheetDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const termSheet = await this.termSheets.findById(tenantId, TermSheetId.create(id));
    if (!termSheet) throw new NotFoundError(`Term sheet not found: ${id}`);
    return toTermSheetDto(termSheet);
  }
}
