"use client"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table"

type RegistroSanidadApiResponse = {
    attributes: string[];
    data: Record<string, String>[];
};

export default function HistorialSanidad() {
    const [attributes, setAttributes] = useState<string[]>([]);
    const [registros, setRegistros] = useState<Record<string, unknown>[]>([]);

    useEffect(() => {
        fetch("/api/registros-sanidad")
            .then((res) => res.json() as Promise<RegistroSanidadApiResponse>)
            .then((data) => {
                setAttributes(data.attributes);
                setRegistros(data.data);
            })
            .catch((err) => {
                console.error("Failed to fetch users:", err);
            });
    }, []);

    return (
        <>
            <h1>Historial de sanidad</h1>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {attributes.map((attr) => (
                                <TableHead key={attr}>{attr}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registros.map((registros, i) => (
                            <TableRow key={i}>
                                {attributes.map((attr) => (
                                    <TableCell key={attr}>{String(registros[attr] ?? "")}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button type="button" className="destructive flex items-center gap-1 w-[141px] h-[40px] min-w-[80px] px-3 py-2 rounded-md bg-red-600 text-white opacity-100"
            ><Trash2/>Eliminar Perro</Button>
        </>
    );
}