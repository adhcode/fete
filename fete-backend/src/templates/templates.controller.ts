import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateSchema, UpdateTemplateSchema } from './dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/templates')
export class TemplatesController {
  constructor(private templates: TemplatesService) {}

  @Public()
  @Get()
  async listTemplates() {
    return this.templates.getTemplates();
  }

  @Public()
  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templates.getTemplate(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTemplate(
    @Body() body: any,
    @CurrentUser() user: { id: string },
  ) {
    const dto = CreateTemplateSchema.parse(body);
    return this.templates.createTemplate(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { id: string },
  ) {
    const dto = UpdateTemplateSchema.parse(body);
    return this.templates.updateTemplate(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.templates.deleteTemplate(id, user.id);
  }
}
