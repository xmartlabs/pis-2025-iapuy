import { useContext, useEffect, useState } from "react";
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
    const context = useContext(LoginContext);
    const token = context?.tokenJwt ?? undefined;
    const getDate = (): Date[] =>(
        [new Date()] 
        //this will be changed when the UI for date selection is ready on the "detalle institucion" User story,
        //it will be the filter multiselect button instead of a param
        /*const datesParam = searchParams.get("dates");
            if (!datesParam || datesParam.trim() === "") {
                return [];
            }
            try {
                const dateStrings = datesParam.split(",");
                const dates = dateStrings
                .map((dateStr) => {
                const trimmed = dateStr.trim();
                const date = new Date(trimmed);
                if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                    //Parse as local date to avoid timezone shifts
                    const [year, month, day] = trimmed.split("-").map(Number);
                    return new Date(year, month - 1, day);
                }
                return date;
                })
                .filter((date) => !isNaN(date.getTime()));
                return dates;
            } 
            catch {
                return [];
            }
        }*/
        
    );
    const handleDelete = async (idI: string) => {
        try {
            const response = await fetch(`/api/intervention?id=${idI}`, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                setError("Error eliminando intervención");
            }else{
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
            // params.set("dates", "2025-01-01,2025-01-31"); // opcional

            const response = await fetch(
                `/api/instituciones/${id}/interventions?${params.toString()}`,
                {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                }
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

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
    }, [token, id, page, size]);
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    const selectedDates = getDate();
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
                    <Button
                            className="max-w-[40px] h-[40px] p-3 gap-0 
                                    rounded border border-[#BDD7B3] bg-white flex items-center justify-center"
                    >
                        <Funnel className="w-[16px] h-[16px] text-[#5B9B40]" />
                    </Button>
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
    const context = useContext(LoginContext);
    const token = context?.tokenJwt ?? undefined;
    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await fetch(`/api/instituciones/${id}`,{
                    headers:{
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    }                              
                });
                if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
                }
                const result = await response.json() as APIInstitutionResponse;
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
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        });
    }, [token, id]);
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
