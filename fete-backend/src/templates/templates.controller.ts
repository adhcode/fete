import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateSchema, UpdateTemplateSchema } from './dto';

@Controller('api/templates')
export class TemplatesController {
  constructor(private templates: TemplatesService) {}

  @Get()
  async listTemplates() {
    return this.templates.getTemplates();
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templates.getTemplate(id);
  }

  @Post()
  async createTemplate(@Body() body: any) {
    const dto = CreateTemplateSchema.parse(body);
    return this.templates.createTemplate(dto);
  }

  @Patch(':id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    const dto = UpdateTemplateSchema.parse(body);
    return this.templates.updateTemplate(id, dto);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templates.deleteTemplate(id);
  }
}
