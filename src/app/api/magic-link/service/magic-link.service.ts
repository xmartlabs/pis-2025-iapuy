import { ResetToken } from "@/app/models/reset-tokens.entity";
import { User } from "@/app/models/user.entity";
import sequelize from "@/lib/database";
import { createHash, randomBytes } from "node:crypto";
import { Op } from "sequelize";

export class MagicLinkService {
  static readonly TOKEN_SIZE_BYTES: number = 32;
  static readonly RESET_TOKEN_EXPIRATION_MINUTES = Number.parseInt(
    process.env.RESET_TOKEN_EXPIRATION_MINUTES || "60",
    10
  );

  generateToken(): { token: string; tokenHash: string } {
    const buffer = randomBytes(MagicLinkService.TOKEN_SIZE_BYTES);
    const token = buffer.toString("hex");

    const hash = createHash("sha256").update(token).digest("hex");
    return { token, tokenHash: hash };
  }

  async createResetTokenForUser(
    userId: string
  ): Promise<{ token: string; expiresAt: Date }> {
    const { token, tokenHash } = this.generateToken();
    const expiresAt = new Date(
      Date.now() + MagicLinkService.RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );

    const transaction = await sequelize.transaction();

    try {
      await Promise.all([
        ResetToken.update(
          { used: true },
          {
            where: {
              userId,
              used: false,
            },
            transaction,
          }
        ),
        ResetToken.create(
          {
            userId,
            tokenHash,
            expiresAt,
            used: false,
          },
          { transaction }
        ),
      ]);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return { token, expiresAt };
  }

  async verifyResetToken(
    receivedToken: string
  ): Promise<{ ci: string; nombre: string }> {
    const receivedHash = createHash("sha256")
      .update(receivedToken)
      .digest("hex");

    const record = await ResetToken.findOne({
      where: {
        tokenHash: receivedHash,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      include: [
        {
          model: User,
          as: "UserToReset",
          required: true,
          attributes: ["ci", "nombre"],
        },
      ],
    });

    if (!record) throw new Error("Invalid token");

    record.used = true;
    await record.save();

    return { ci: record.UserToReset!.ci, nombre: record.UserToReset!.nombre };
  }
}
