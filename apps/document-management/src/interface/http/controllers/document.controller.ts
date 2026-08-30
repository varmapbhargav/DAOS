import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddDocumentVersionCommand } from '../../../application/commands/add-document-version.command';
import { UploadDocumentCommand } from '../../../application/commands/upload-document.command';
import { AddDocumentVersionDto } from '../../../application/dto/add-document-version.dto';
import { UploadDocumentDto } from '../../../application/dto/upload-document.dto';
import { GenerateDownloadUrlQuery } from '../../../application/queries/generate-download-url.query';
import { GetDocumentQuery } from '../../../application/queries/get-document.query';
import { GetDocumentVersionQuery } from '../../../application/queries/get-document-version.query';
import { ListDocumentsQuery } from '../../../application/queries/list-documents.query';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new document with its first version' })
  upload(@Body() dto: UploadDocumentDto) {
    return this.commandBus.execute(new UploadDocumentCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  list() {
    return this.queryBus.execute(new ListDocumentsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetDocumentQuery(id));
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Get a specific version of a document' })
  getVersion(@Param('id') id: string, @Param('versionNumber') versionNumber: string) {
    return this.queryBus.execute(new GetDocumentVersionQuery(id, Number(versionNumber)));
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Add a new version to a document' })
  addVersion(@Param('id') id: string, @Body() dto: AddDocumentVersionDto) {
    return this.commandBus.execute(new AddDocumentVersionCommand(id, dto));
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Generate a signed download URL for a document version' })
  downloadUrl(
    @Param('id') id: string,
    @Query('versionNumber') versionNumber: string,
    @Query('expiresInSeconds') expiresInSeconds?: string,
  ) {
    return this.queryBus.execute(
      new GenerateDownloadUrlQuery(id, Number(versionNumber), expiresInSeconds ? Number(expiresInSeconds) : undefined),
    );
  }
}