import { MagicLinkService } from "../service/magic-link.service";

export class MagicLinkController {
  constructor(
    private readonly magicLinkService: MagicLinkService = new MagicLinkService()
  ) {}

  async createMagicLink(ci: string, nombre: string): Promise<string> {
    const { token, expiresAt } =
      await this.magicLinkService.createResetTokenForUser(ci);

    const url = `/app/reset-password?ci=${ci}&nombre=${nombre}&token=${token}&expiresAt=${expiresAt.toISOString()}`;

    return url;
  }
}
