/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { type PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import sequelize from "@/lib/database";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

export class InstitucionesService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Institucion>> {
    const result = await Institucion.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        {
          model: Patologia,
          as: "Patologias",
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async create(institutionDTO: CreateInstitutionDTO): Promise<Institucion> {
    return await sequelize.transaction(async (t) => {
      const existe =
        (await Institucion.findOne({
          where: { nombre: institutionDTO.name },
          transaction: t,
        })) !== null;
      if (existe) {
        throw new Error("Ya existe una institucion con el nombre elegido.");
      }

      const institution: Institucion = await Institucion.create(
        {
          nombre: institutionDTO.name,
        },
        { transaction: t }
      );
      await Promise.all(
        institutionDTO.institutionContacts.map((contact) =>
          InstitutionContact.create(
            {
              name: contact.name,
              contact: contact.contact,
              institutionId: institution.id,
            },
            { transaction: t }
          )
        )
      );
      await Promise.all(
        institutionDTO.pathologies.map(async (name) => {
          const [pathology] = await Patologia.findOrCreate({
            where: { nombre: name },
            defaults: { nombre: name },
            transaction: t,
          });
          await InstitucionPatologias.findOrCreate({
            where: { institucionId: institution.id, patologiaId: pathology.id },
            defaults: {
              institucionId: institution.id,
              patologiaId: pathology.id,
            },
            transaction: t,
          });
        })
      );
      return institution;
    });
  }

  async findAllSimple(): Promise<Array<{ id: string; name: string }>> {
    const result = await Institucion.findAll({
      attributes: ["id", "nombre"],
    });

    return result.map((institucion) => ({
      id: institucion.id,
      name: institucion.nombre,
    }));
  }

  async delete(id: string): Promise<void> {
    const res = await Institucion.destroy({ where: { id } });
    if (res === 0) {
      throw new Error(`Institution not found with id: ${id}`);
    }
  }

  async interventionsPDF(id: string, dates: Date[]): Promise<Uint8Array> {
    const interventions = await Intervention.findAll({
      where:
        dates && dates.length > 0
          ? {
              [Op.or]: dates.map((rawDate) => {
                const date = new Date(rawDate);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return {
                  [Op.and]: [
                    sequelize.where(
                      sequelize.fn(
                        "EXTRACT",
                        sequelize.literal(`YEAR FROM "timeStamp"`)
                      ),
                      year
                    ),
                    sequelize.where(
                      sequelize.fn(
                        "EXTRACT",
                        sequelize.literal(`MONTH FROM "timeStamp"`)
                      ),
                      month
                    ),
                  ],
                };
              }),
            }
          : undefined,
      include: [
        {
          model: Institucion,
          as: "Institucions",
          where: { id },
          required: true,
          attributes: [],
        },
      ],
    });

    // Create a PDF document summarizing the interventions
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();
    const margin = 50;
    const fontSizeTitle = 18;
    const fontSizeHeader = 12;
    const fontSize = 10;
    const rowHeight = 22; // increased spacing between rows

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Watermark image + brand text (logo + "IAPUy") on the background/top
    try {
      // load image from public folder
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const pngImage = await pdfDoc.embedPng(logoBytes);
        const pngDims = pngImage.scale(0.6);
        // center the watermark and make it faint
        const wmWidth = Math.min(Number(pngDims.width), width / 2);
        const wmHeight =
          (Number(pngDims.height) / Number(pngDims.width)) * wmWidth;
        currentPage.drawImage(pngImage, {
          x: (width - wmWidth) / 2,
          y: (height - wmHeight) / 2,
          width: wmWidth,
          height: wmHeight,
          opacity: 0.12,
        } as any);

        // brand text to the right of the logo (top-left area)
        currentPage.drawText("IAPUy", {
          x: margin,
          y: height - margin,
          size: 28,
          font: timesRomanFont,
          color: rgb(0.0, 0.6, 0.2),
        });
      } else {
        // fallback title if no image found
        currentPage.drawText("Intervenciones", {
          x: margin,
          y: height - margin - fontSizeTitle,
          size: fontSizeTitle,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
      }
    } catch {
      // if anything fails embedding the image, fallback to title
      currentPage.drawText("Intervenciones", {
        x: margin,
        y: height - margin - fontSizeTitle,
        size: fontSizeTitle,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
    }

    // Table headers - giving more space to "Descripción"
    const headers = [
      "Fecha",
      "Tipo",
      "Status",
      "Costo",
      "Pares",
      "Descripción",
    ];
    const startY = height - margin - fontSizeTitle - 25;
    let y = startY;

    // Adjusted column widths - giving more space to "Descripción" column
    const colWidths = [
      70, // Fecha - reduced
      60, // Tipo - reduced
      60, // Status - reduced
      50, // Costo - reduced
      40, // Pares - reduced
      width - margin * 2 - (70 + 60 + 60 + 50 + 40), // Descripción - gets remaining space
    ];

    const xPositions: number[] = [];
    let x = margin;
    for (let i = 0; i < colWidths.length; i++) {
      xPositions.push(x);
      x += colWidths[i];
    }

    // Draw header function so we can repeat on new pages
    const drawTableHeader = (page: any) => {
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: xPositions[i] + 2,
          y,
          size: i === 5 ? fontSizeHeader : 10, // "Descripción" has font size 12, others 10
          font: timesRomanFont,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
      y -= fontSizeHeader + 6;
    };

    drawTableHeader(currentPage);

    // Improved text wrapping function
    const wrapText = (
      text: string,
      font: any,
      size: number,
      maxW: number
    ): string[] => {
      if (!text) return [""];

      const words = text.split(/\s+/);
      const lines: string[] = [];
      let currentLine = words[0] ?? "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = `${currentLine} ${word}`;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth <= maxW) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Draw rows with multi-line wrapping for all columns to prevent text overflow
    for (const interv of interventions) {
      // Prepare row values
      const dateStr = interv.timeStamp
        ? new Date(interv.timeStamp).toLocaleString().split(",")[0]
        : "";
      const tipo = (interv.tipo as unknown as string) ?? "";
      const status = (interv.status as unknown as string) ?? "";
      const costo =
        interv.costo !== null && interv.costo !== undefined
          ? String(interv.costo)
          : "";
      const pares =
        interv.pairsQuantity !== null && interv.pairsQuantity !== undefined
          ? String(interv.pairsQuantity)
          : "";
      const desc = interv.description ? String(interv.description) : "";

      // Wrap text for ALL columns to prevent overflow
      const wrappedValues: string[][] = [];
      for (let i = 0; i < colWidths.length - 1; i++) {
        const value = [dateStr, tipo, status, costo, pares][i];
        const maxWidth = colWidths[i] - 4;
        wrappedValues.push(wrapText(value, timesRomanFont, fontSize, maxWidth));
      }

      // Wrap description separately with more space
      const descMaxWidth = colWidths[5] - 4;
      const descLines = wrapText(desc, timesRomanFont, fontSize, descMaxWidth);
      wrappedValues.push(descLines);

      // Calculate total lines needed for this row
      const maxLines = Math.max(...wrappedValues.map((lines) => lines.length));
      const neededHeight = maxLines * rowHeight;

      // If not enough space, add new page and draw header
      if (y - neededHeight < margin) {
        currentPage = pdfDoc.addPage();
        y = height - margin - fontSizeTitle - 25;
        drawTableHeader(currentPage);
      }

      // Draw all columns with proper text wrapping
      for (let col = 0; col < wrappedValues.length; col++) {
        const lines = wrappedValues[col];
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          currentPage.drawText(lines[lineIndex], {
            x: xPositions[col] + 2,
            y: y - lineIndex * rowHeight,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });
        }
      }

      // advance y by lines used
      y -= neededHeight;
    }

    const pdfBytes = (await pdfDoc.save()) as Uint8Array;
    return pdfBytes;
  }
}
