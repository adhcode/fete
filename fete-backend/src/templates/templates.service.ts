import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    // If overlayUrl is provided, we'll store it as overlayKey
    // For MVP, assume overlayUrl is already a public R2 URL or we'll handle upload separately
    const overlayKey = dto.overlayUrl 
      ? this.extractKeyFromUrl(dto.overlayUrl) 
      : null;

    const template = await this.prisma.template.create({
      data: {
        name: dto.name,
        config: dto.config as any,
        overlayKey,
        previewUrl: null, // Can be set later
      },
    });

    return this.mapTemplateToResponse(template);
  }

  async getTemplates() {
    const templates = await this.prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        previewUrl: true,
        createdAt: true,
      },
    });

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      previewUrl: t.previewUrl || this.getDefaultPreviewUrl(t.id),
    }));
  }

  async getTemplate(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.mapTemplateToResponse(template);
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const overlayKey = dto.overlayUrl
      ? this.extractKeyFromUrl(dto.overlayUrl)
      : template.overlayKey;

    const updated = await this.prisma.template.update({
      where: { id },
      data: {
        name: dto.name ?? template.name,
        config: dto.config ? (dto.config as any) : template.config,
        overlayKey,
      },
    });

    return this.mapTemplateToResponse(updated);
  }

  async deleteTemplate(id: string) {
    await this.prisma.template.delete({
      where: { id },
    });

    return { success: true };
  }

  private mapTemplateToResponse(template: any) {
    return {
      id: template.id,
      name: template.name,
      overlayUrl: template.overlayKey
        ? this.storage.publicUrl(template.overlayKey)
        : null,
      previewUrl: template.previewUrl || this.getDefaultPreviewUrl(template.id),
      config: template.config,
      createdAt: template.createdAt,
    };
  }

  private extractKeyFromUrl(url: string): string | null {
    // Extract R2 key from public URL
    // Example: https://pub-xxx.r2.dev/templates/abc/overlay.png -> templates/abc/overlay.png
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.startsWith('/') 
        ? urlObj.pathname.slice(1) 
        : urlObj.pathname;
      return path;
    } catch {
      return null;
    }
  }

  private getDefaultPreviewUrl(templateId: string): string | undefined {
    // Return preview URL if it exists in R2
    const previewKey = `templates/${templateId}/preview.jpg`;
    return this.storage.publicUrl(previewKey);
  }
}
