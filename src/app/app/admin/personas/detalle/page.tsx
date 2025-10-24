'use client'

import React, { Suspense } from "react";
import { useContext} from "react";
import { useSearchParams } from "next/navigation";
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";
import { LoginContext } from "@/app/context/login-context";
import type { UserSanitized } from "@/app/api/users/service/user.service.ts";

function DetallePersonaContent() {
  const context = useContext(LoginContext);
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";

  const token = context?.tokenJwt;
  const baseHeaders: Record<string, string> = {
     Accept: "application/json",
     ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUser = async (): Promise<UserSanitized | null> => {
    const resp = await fetch(`/aoi/users/${ci}`, {
      method: "GET",
      headers: baseHeaders,
    });
    if (!resp) {
      return null;
    } 
    const respJson = await resp.json() as UserSanitized;
    return respJson;
};
  return (
    <div className="flex flex-col">
      Detalle Persona CI: {ci}, nombre
      <BotonEliminarUsuario ci={ci} />
    </div>
  );
}

export default function DetallePersona() {
  return (
    <Suspense fallback={<div>Cargando persona...</div>}>
      <DetallePersonaContent />
    </Suspense>
  );
}

/*
How to call the GET


const resp = fetch(`/aoi/users/${ci}`, {
    method: "GET",
    headers: baseHeaders,
  });

// src\app\api\users\[ci]\route.ts
import { NextResponse, type NextRequest } from "next/server";
import { UserController } from "../controller/user.controller";
import { initDatabase } from "@/lib/init-database";
const userController = new UserController();

await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ci: string }> }
) {
  try {
    const { ci } = await params;
    const data = await userController.getUser(request, { ci });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
  */