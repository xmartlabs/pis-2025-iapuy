import { NextResponse, NextRequest } from "next/server";
import { UserController } from "./controller/user.controller";
import { initDatabase } from "@/lib/init-database";
import { extractPagination } from "@/lib/pagination/extraction";
import { UniqueConstraintError } from "sequelize";
import { type UpdateUserDto } from "./dtos/update-user.dto";

const userController = new UserController();

await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    const data = await userController.getUsers(pagination);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await userController.createUser(request));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const first = error.errors?.[0];
      let path: string | undefined = first?.path ?? undefined;
      let value: unknown = first?.value;

      const errObj = error as unknown as {
        parent?: { detail?: string; constraint?: string };
        message?: string;
        fields?: Record<string, unknown>;
      };

      const fields = errObj.fields;
      if (
        (!path || value === undefined) &&
        fields &&
        Object.keys(fields).length > 0
      ) {
        const key = Object.keys(fields)[0];
        path ??= key;
        value = value === undefined ? fields[key] : value;
      }

      const parentDetail = errObj.parent?.detail;
      const errMsg = errObj.message;
      const detailToParse = parentDetail ?? errMsg;
      if ((!path || value === undefined) && detailToParse) {
        const pg = /Key \(([^)]+)\)=\(([^)]+)\)/.exec(detailToParse);
        if (pg) {
          path ??= pg[1];
          value = value === undefined ? pg[2] : value;
        } else {
          const my = /Duplicate entry '([^']+)' for key '([^']+)'/.exec(
            detailToParse
          );
          if (my) {
            value = value === undefined ? my[1] : value;
            const keyPart = my[2].split(".").pop();
            path ??= keyPart;
          }
        }
      }

      if ((!path || value === undefined) && errObj.parent?.constraint) {
        const constraint = errObj.parent.constraint;
        const maybe = constraint
          .replace(/(_key|_unique|_idx)$/i, "")
          .split("_")
          .slice(-1)[0];
        if (maybe) path ??= maybe;
      }

      const displayPath = path ?? "campo";
      const prettyField =
        displayPath === "pkey"
          ? "CI"
          : displayPath
              .replace(/([A-Z])/g, " $1")
              .replace(/_/g, " ")
              .trim();

      let displayValue: string | undefined = undefined;
      if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          try {
            displayValue = JSON.stringify(value);
          } catch {
            displayValue = Object.prototype.toString.call(value);
          }
        } else if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          typeof value === "bigint"
        ) {
          displayValue = String(value);
        } else {
          displayValue = String(value as unknown);
        }
      }

      const message = displayValue
        ? `El campo ${prettyField} "${displayValue}" ya está en uso`
        : `El campo ${prettyField} ya está en uso`;

      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username: string;
      updateData: UpdateUserDto;
    };
    const { username, ...updateData } = body;

    const updateRequest = new NextRequest(request, {
      body: JSON.stringify(updateData),
    });

    return NextResponse.json(
      await userController.updateUser(updateRequest, { username })
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ci: string = request.nextUrl.searchParams.get("ci") ?? "";
    const res: boolean = await userController.deleteUser(ci);

    if (res) {
      return NextResponse.json(
        { success: true, message: "User deleted successfully" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "User not found.",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
