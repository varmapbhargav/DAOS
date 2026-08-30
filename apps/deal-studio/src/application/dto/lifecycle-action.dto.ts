import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class ActorReasonDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiPropertyOptional({ example: 'Reason for this action' })
  @IsOptional() @IsString() @MinLength(3)
  reason?: string;
}

export class RejectDealDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiProperty({ example: 'Deal economics do not meet minimum return threshold' })
  @IsString() @MinLength(10)
  reason!: string;
}

export class SubmitForApprovalDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiProperty({ example: 'workflow-uuid' })
  @IsString()
  workflowId!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  reason?: string;
}

export class PutOnHoldDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;

  @ApiProperty({ example: 'Awaiting updated valuation report' })
  @IsString() @MinLength(5)
  holdReason!: string;
}

export class AddParticipantDto {
  @ApiProperty({ example: 'entity-uuid' })
  @IsString()
  entityId!: string;

  @ApiProperty({ example: 'LENDER' })
  @IsEnum([
    'SPONSOR','BORROWER','SELLER','BUYER','LENDER',
    'INVESTOR','GUARANTOR','ADVISOR','LEGAL_COUNSEL','ADMINISTRATOR',
  ])
  role!: string;
}

export class AddClosingConditionDto {
  @ApiProperty({ example: 'LEGAL' })
  @IsEnum([
    'LEGAL','REGULATORY','FINANCIAL','TAX','TECHNICAL',
    'COMMERCIAL','OPERATIONAL','INVESTOR','DOCUMENTATION',
  ])
  category!: string;

  @ApiProperty({ example: 'Executed Loan Agreement' })
  @IsString() @MinLength(5)
  conditionType!: string;

  @ApiProperty({ example: 'Borrower must provide executed loan agreement signed by all parties' })
  @IsString() @MinLength(10)
  description!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  responsibleParty?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  dueDate?: string;

  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  actorId!: string;
}

export class VerifyConditionDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  verifiedBy!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  documentReference?: string;
}

export class WaiveConditionDto {
  @ApiProperty({ example: 'actor-uuid' })
  @IsString()
  waivedBy!: string;

  @ApiProperty({ example: 'Condition waived with senior credit committee approval' })
  @IsString() @MinLength(10)
  reason!: string;
}
