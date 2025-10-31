import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import CustomBreadCrumb from "../bread-crumb/bread-crumb";
import { LoginContext } from "@/app/context/login-context";
import { Button } from "@/components/ui/button";
import { Funnel, Trash2 } from "lucide-react";
import { DownloadButton } from "./download-pdf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import CustomPagination from "../pagination";
import DeleteInstitutionButton from "./eliminar-institucion";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
interface Props{
    id:string,

}
export type APIInstitutionResponse = {
  id: string;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Patologias: {
    id: string;
    nombre: string;
  }[];
  InstitutionContacts: {
    id: string;
    name: string;
    contact: string;
  }[];
};
type ReferentCardProps = {
  Contact: APIInstitutionResponse["InstitutionContacts"][number];
};
const ReferentCard=({Contact}:ReferentCardProps)=>(
    <div className="max-w-[351px] max-h-[88px] gap-10 
                    p-6 rounded-lg border border-[#BDD7B3] 
                    bg-white flex items-center justify-start">
        <p>
            Nombre
            <br/>
            {Contact.name}
        </p>
        <p>
            Contacto
            <br/>
            {Contact.contact}
        </p>
    </div>
);

const FilterDropDown = ({
    selectedMes,
    selectedAnio,
    onRangeChange,
    onMesAnioChange
}: {
    selectedMes: string;
    selectedAnio: string;
    onRangeChange?: (range: { fechaInicio: Date | null; fechaFin: Date | null }) => void;
    onMesAnioChange?: (mes: string, anio: string) => void;
}) => {
    const handleChange = (nuevoMes: string, nuevoAnio: string) => {
        onMesAnioChange?.(nuevoMes, nuevoAnio);

        if (nuevoAnio === "Todos") {
            onRangeChange?.({ fechaInicio: null, fechaFin: null });
            return;
        }

        const yearNum = parseInt(nuevoAnio, 10);
        const monthNum = nuevoMes === "Todos" ? null : parseInt(nuevoMes, 10) - 1;

        if (monthNum === null) {
            onRangeChange?.({
                fechaInicio: new Date(yearNum, 0, 1),
                fechaFin: new Date(yearNum, 11, 31, 23, 59, 59, 999),
            });
        } else {
            const inicio = new Date(yearNum, monthNum, 1);
            const fin = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);
            onRangeChange?.({ fechaInicio: inicio, fechaFin: fin });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="max-w-[40px] h-[40px] p-3 gap-0 rounded border border-[#BDD7B3] bg-white flex items-center justify-center">
                    <Funnel className="w-[16px] h-[16px] text-[#5B9B40]" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[320px] p-4" align="end" side="bottom">
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col flex-1">
                        <Label className="text-sm font-medium text-gray-700 mb-1">Mes</Label>
                        <Select
                            value={selectedMes}
                            onValueChange={(nuevoMes) => { handleChange(nuevoMes, selectedAnio); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todos">Todos</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {new Date(0, i).toLocaleString("es-ES", { month: "long" })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col flex-1">
                        <Label className="text-sm font-medium text-gray-700 mb-1">Año</Label>
                        <Select
                            value={selectedAnio}
                            onValueChange={(nuevoAnio) => { handleChange(selectedMes, nuevoAnio); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                <SelectItem value="Todos">Todos</SelectItem>
                                {Array.from({ length: 2101 - 2000 }, (_, i) => {
                                    const year = 2000 + i;
                                    return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export interface APIInstitutionIntervention {
  id: string;
  timeStamp: string; // ISO string
  UsrPerroIntervention: {
    id: string;
    User: {
      ci: string;
      nombre: string;
    };
    Perro: {
      id: string;
      nombre: string;
    };
  }[];
  Pacientes: {
    id: string;
    nombre: string;
  }[];
}
const InterventionGrid=({ id }: { id: string })=>{
    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error,setError] =useState<string>("");
    const [data, setData] = useState<APIInstitutionIntervention[]>([]);
    const context = useContext(LoginContext)!;
    const [selectedMes, setSelectedMes] = useState<string>("Todos");
    const [selectedAnio, setSelectedAnio] = useState<string>("Todos");
    const [selectedRange, setSelectedRange] = useState<{ fechaInicio: Date | null; fechaFin: Date | null }>({
        fechaInicio: null,
        fechaFin: null,
    });
    const handleMesAnioChange = (mes: string, anio: string) => {
        setSelectedMes(mes);
        setSelectedAnio(anio);

        if (anio === "Todos") {
        setSelectedRange({ fechaInicio: null, fechaFin: null });
        return;
        }

        const yearNum = parseInt(anio, 10);
        const monthNum = mes === "Todos" ? null : parseInt(mes, 10) - 1;

        if (monthNum === null) {
        setSelectedRange({
            fechaInicio: new Date(yearNum, 0, 1),
            fechaFin: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        });
        } else {
        setSelectedRange({
            fechaInicio: new Date(yearNum, monthNum, 1),
            fechaFin: new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999),
        });
        }
    };
    const selectedDates = useMemo(() => {
        if (selectedRange.fechaInicio && selectedRange.fechaFin) {
            return [selectedRange.fechaInicio, selectedRange.fechaFin];
        }
        return [];
    }, [selectedRange.fechaInicio, selectedRange.fechaFin]);
    const handleRangeChange = useCallback(
        ({ fechaInicio, fechaFin }: { fechaInicio: Date | null; fechaFin: Date | null }) => {
            setSelectedRange({ fechaInicio, fechaFin });
        },
    []
    );
    const handleDelete = async (idI: string) => {
        try {
            const response = await fetchWithAuth(context, `/api/intervention?id=${idI}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },});

            if (!response.ok) {
                setError("Error eliminando intervención");
            } else {
                setData(prev => prev.filter(interv => interv.id !== idI));
            }
        } catch (error2) {
            if (error2 instanceof Error) {
                setError("Error eliminando intervención");
            } else {
                setError("Error desconocido al eliminar intervención");
            }
        }
    };
    useEffect(() => {
        setLoading(true);
        setError("");
        const fetchData = async () => {
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("size", String(size));

                if (selectedRange.fechaInicio && selectedRange.fechaFin) {
                const pad2 = (n: number) => n.toString().padStart(2, "0");

                const formatDate = (d: Date, endOfDay = false) =>
                    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T` +
                    `${pad2(endOfDay ? 23 : d.getHours())}:` +
                    `${pad2(endOfDay ? 59 : d.getMinutes())}:` +
                    `${pad2(endOfDay ? 59 : d.getSeconds())}`;

                const fechaInicioStr = formatDate(selectedRange.fechaInicio);
                const fechaFinStr = formatDate(selectedRange.fechaFin, true);

                params.set("dates", `${fechaInicioStr},${fechaFinStr}`);
                }

                const response = await fetchWithAuth(
                context,
                `/api/instituciones/${id}/interventions?${params.toString()}`
                );

                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

                const result = (await response.json()) as PaginationResultDto<APIInstitutionIntervention>;
                setData(result.data ?? []);
                setTotalPages(result.totalPages ?? 1);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError(String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchData().catch((err) => {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
            setLoading(false);
        });
        }, [id, page, size, selectedRange.fechaInicio, selectedRange.fechaFin, context]);
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    return(
        <div className="flex flex-col gap-[20px]">
            <div className="flex flex-row justify-between">
                <h1 className=" font-serif font-semibold text-2xl
                                leading-8 tracking-[-0.6px] align-middle
                                text-[#1B2F13]" 
                >
                    Historial de intervenciones
                </h1>
                <div className="flex flex-row gap-5">
                    
                        <FilterDropDown
                            selectedMes={selectedMes}
                            selectedAnio={selectedAnio}
                            onRangeChange={handleRangeChange}
                            onMesAnioChange={handleMesAnioChange}
                        />
                    <DownloadButton id={id} dates={selectedDates} />
                </div>
            </div>
            <div className="w-full overflow-x-auto  border border-gray-300 rounded-lg">
                <Table className="min-w-full table-fixed">
                    <TableHeader>
                        <TableRow className="border-b border-gray-200 -mt-px">
                            <TableHead className="px-6 py-3 text-left text-sm font-medium first:rounded-tl-lg last:rounded-tr-lg">
                                Fecha y hora
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium first:rounded-tl-lg last:rounded-tr-lg">
                                Guías
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium first:rounded-tl-lg last:rounded-tr-lg">
                                Perros
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium first:rounded-tl-lg last:rounded-tr-lg">
                                Pacientes
                            </TableHead>
                            <TableHead className="px-6 py-3 w-[64px] text-left text-sm font-medium first:rounded-tl-lg last:rounded-tr-lg"/>                        
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[64px]" /></TableCell>
                            </TableRow>
                        ))
                        ) : data.length > 0 ? (
                        data.map((p) => (
                            <TableRow
                            key={p.id}
                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            >
                                <TableCell className="px-6 py-4">
                                    {new Date(p.timeStamp).toLocaleString()}
                                </TableCell>

                                {<TableCell className="px-6 py-4">
                                    {p.UsrPerroIntervention.length > 0
                                    ? p.UsrPerroIntervention.map((u, i) => (
                                        <span key={i}>
                                            {u.User.nombre}
                                            {i < p.UsrPerroIntervention.length - 1 && ", "}
                                        </span>
                                        ))
                                    : "Sin guías"}
                                </TableCell>}

                                <TableCell className="px-6 py-4">
                                    {p.UsrPerroIntervention.length > 0
                                    ? p.UsrPerroIntervention.map((u, i) => (
                                        <span key={i}>
                                            {u.Perro.nombre}
                                            {i < p.UsrPerroIntervention.length - 1 && ", "}
                                        </span>
                                        ))
                                    : "Sin perros"}
                                </TableCell>

                                <TableCell className="px-6 py-4">
                                    {p.Pacientes.length > 0
                                    ? p.Pacientes.map((pac, i) => (
                                        <span key={i}>
                                            {pac.nombre}
                                            {i < p.Pacientes.length - 1 && ", "}
                                        </span>
                                        ))
                                    : "Sin pacientes"}
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Button
                                        className=" flex items-center justify-center gap-0
                                                     p-0 pr-0 pl-0 bg-transparent                        
                                                    text-[#5B9B40] hover:bg-gray-100 rounded opacity-100"
                                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                        onClick={() => { handleDelete(p.id); }}
                                    >
                                        <Trash2 className="!w-[16px] !h-[16px]" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-36 px-6 py-8 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                            </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <CustomPagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />
            )}
        </div>
    );
};

export default function InstitutionDetail({id}:Props){
    
    const [data, setData] = useState<APIInstitutionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const context = useContext(LoginContext)!;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchWithAuth(context, `/api/instituciones/${id}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const result = (await response.json()) as APIInstitutionResponse;
                setData(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData().catch((err) => {
            if (err instanceof Error) setError(err.message);
            else setError(String(err));
        });
    }, [context, id]);
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className="w-full flex flex-col pr-8 gap-8">
            <CustomBreadCrumb 
                link={["/app/admin/instituciones/listado","Instituciones"]}
                current={data?.nombre ?? ""}
                className=""/>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-2.5%] align-middle">
                    {data?.nombre ?? ""}
                </h1>
                {/*
                NO ENTRA EN EL SPRINT
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="w-[90px] h-[40px] min-w-[80px] px-3 py-2 gap-1            
                                    rounded-md bg-[#5B9B40] flex items-center justify-center text-white
                                    hover:bg-[#5B9B40] hover:text-white"
                    >
                        <Pencil className="w-4 h-4" />
                        Editar
                    </Button>
                </div>*/}
            </div>
            <div className="flex flex-col">
                <p className="font-sans font-normal text-base
                                leading-5 tracking-normal text-[#121F0D]"
                >
                    Patologias
                    <br/>
                    {data?.Patologias.map(p => p.nombre).join(", ")}
                </p>
            </div>
            <div className="flex flex-col">
                <h1 className="font-serif font-semibold text-2xl
                                leading-8 tracking-[-0.6px] align-middle
                                text-[#1B2F13]" 
                >
                    Referentes
                </h1>
            </div>
            <div className="flex flex-row gap-8">
                {data?.InstitutionContacts.map(contact => (
                <ReferentCard key={contact.id} Contact={contact} />
                ))}
            </div>
            <InterventionGrid id={id}/>
            <DeleteInstitutionButton id={id} />
        </div>
    );
}
