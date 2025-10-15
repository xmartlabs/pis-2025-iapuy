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
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Paciente } from "@/app/models/pacientes.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";

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
          attributes: ["id", "nombre"],
          through: { attributes: [] },
        },
        {
          model: InstitutionContact,
          as: "InstitutionContacts",
          attributes: ["id", "name", "contact"],
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
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "User",
            },
            {
              model: Perro,
              as: "Perro",
            },
          ],
        },
        {
          model: Paciente,
          as: "Pacientes",
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
    const rowHeight = 22;

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
        } as {
          x: number;
          y: number;
          width: number;
          height: number;
          opacity: number;
        });

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

    // Table headers - Fecha y hora, Guías, Perros, Pacientes
    const headers = ["Fecha y hora", "Guías", "Perros", "Pacientes"];
    const startY = height - margin - fontSizeTitle - 25;
    let y = startY;

    const colWidths = [
      140, // Fecha y hora
      160, // Guías
      120, // Perros
      width - margin * 2 - (140 + 160 + 120), // Pacientes - remaining space
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
          size: fontSizeHeader,
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

    // Table geometry helpers
    const tableLeft = xPositions[0] - 4;
    const tableWidth = colWidths.reduce((a, b) => a + b, 0) + 4;
    const rowPadding = 6;

    // Track per-page bounds so we can draw an outer rounded border per page
    let pageMinBottom: number | null = null;
    let pageTop = startY + rowPadding;

    // Helper to construct an SVG path for a rounded rectangle
    const roundedRectPath = (
      px: number,
      py: number,
      w: number,
      h: number,
      r: number
    ) => {
      const fmt = (n: number) => Number(n.toFixed(2));
      const x1 = fmt(px);
      const y1 = fmt(py);
      const x2 = fmt(px + w);
      const y2 = fmt(py + h);
      const rx = fmt(Math.min(r, w / 2));
      const ry = fmt(Math.min(r, h / 2));

      return (
        `M ${fmt(x1 + rx)} ${y1}` +
        ` H ${fmt(x2 - rx)}` +
        ` A ${rx} ${ry} 0 0 1 ${x2} ${fmt(y1 + ry)}` +
        ` V ${fmt(y2 - ry)}` +
        ` A ${rx} ${ry} 0 0 1 ${fmt(x2 - rx)} ${y2}` +
        ` H ${fmt(x1 + rx)}` +
        ` A ${rx} ${ry} 0 0 1 ${x1} ${fmt(y2 - ry)}` +
        ` V ${fmt(y1 + ry)}` +
        ` A ${rx} ${ry} 0 0 1 ${fmt(x1 + rx)} ${y1}` +
        ` Z`
      );
    };

    // Draw rows with multi-line wrapping for the 4 columns
    for (const interv of interventions) {
      // Prepare row values
      const dateStr = interv.timeStamp
        ? new Date(interv.timeStamp).toLocaleString()
        : "";

      // Guides (Usuarios) and Perros come from UsrPerroIntervention
      const usrPerros: UsrPerro[] =
        (interv.UsrPerroIntervention as UsrPerro[]) || [];
      const guidesArr = usrPerros
        .map((up) => up.User && (up.User.nombre ?? String(up.User.ci)))
        .filter(Boolean) as string[];
      const guides = Array.from(new Set(guidesArr)).join(", ");

      const perrosArr = usrPerros
        .map((up) => up.Perro && (up.Perro.nombre ?? ""))
        .filter(Boolean) as string[];
      const perros = Array.from(new Set(perrosArr)).join(", ");

      const pacientesArr = (interv.PacienteIntervencion || [])
        .map((p: Paciente) => p.nombre)
        .filter(Boolean);
      const pacientes = Array.from(new Set(pacientesArr)).join(", ");

      const values = [dateStr, guides, perros, pacientes];

      const wrappedValues: string[][] = [];
      for (let i = 0; i < colWidths.length; i++) {
        const value = values[i] ?? "";
        const maxWidth = colWidths[i] - 6;
        wrappedValues.push(wrapText(value, timesRomanFont, fontSize, maxWidth));
      }

      // Calculate total lines needed for this row
      const maxLines = Math.max(...wrappedValues.map((lines) => lines.length));
      const neededHeight = maxLines * rowHeight;

      // If not enough space, draw outer border for current page (if any rows drawn), then add new page and draw header
      if (y - neededHeight < margin) {
        if (pageMinBottom !== null) {
          const outerBottom = pageMinBottom - rowPadding;
          const outerHeight = pageTop - outerBottom + rowPadding;
          const svgPath = roundedRectPath(
            tableLeft,
            outerBottom,
            tableWidth,
            outerHeight,
            8
          );
          currentPage.drawSvgPath(svgPath, {
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
        }

        currentPage = pdfDoc.addPage();
        y = height - margin - fontSizeTitle - 25;
        drawTableHeader(currentPage);
        // reset per-page bounds
        pageMinBottom = null;
        pageTop = startY + rowPadding;
      }

      // Draw rounded rect for this row
      const rectX = tableLeft;
      const rectBottom = y - neededHeight - rowPadding / 2;
      const rectHeight = neededHeight + rowPadding;
      const rectWidth = tableWidth;
      const svgPath = roundedRectPath(
        rectX,
        rectBottom,
        rectWidth,
        rectHeight,
        6
      );
      currentPage.drawSvgPath(svgPath, {
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.6,
      });

      // update page min bottom for outer border
      pageMinBottom =
        pageMinBottom === null
          ? rectBottom
          : Math.min(pageMinBottom, rectBottom);

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

    // Draw outer border for last page if needed
    if (pageMinBottom !== null) {
      const outerBottom = pageMinBottom - rowPadding;
      const outerHeight = pageTop - outerBottom + rowPadding;
      const svgPath = roundedRectPath(
        tableLeft,
        outerBottom,
        tableWidth,
        outerHeight,
        8
      );
      currentPage.drawSvgPath(svgPath, {
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
