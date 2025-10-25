import { useContext, useEffect, useState } from "react";
import CustomBreadCrumb from "../bread-crumb/bread-crumb";
import { LoginContext } from "@/app/context/login-context";
import { Button } from "@/components/ui/button";
import { Funnel, Pencil } from "lucide-react";
import { DownloadButton } from "./download-pdf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
const InterventionGrid=({ id }: { id: string })=>{
    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
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
                            <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                            Fecha y hora
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                            Guías
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                            Perros
                            </TableHead>
                            <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                            Pacientes
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="px-6 py-4">
                                <TableCell className="px-6 py-4">
                                    <Skeleton className="h-4 w-[140px]" />
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Skeleton className="h-4 w-[160px]" />
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Skeleton className="h-4 w-[160px]" />
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Skeleton className="h-4 w-[160px]" />
                                </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            /* 
                            institutions.map((p) => (
                                <TableRow
                                key={p.id}
                                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => go(p.id)}
                                >
                                <TableCell className="px-6 py-4 align-middle">
                                    <div className="flex items-center gap-3">
                                    <span className="text-base md:text-base ml-2">
                                        {p.nombre}
                                    </span>
                                    </div>
                                </TableCell>

                                <TableCell className="px-6 py-4 align-middle">
                                    <div className="flex items-center gap-2 text-sm">
                                    {p.InstitutionContacts.map((contact, index) => (
                                        <span key={contact.id || index}>
                                        {contact.name} - {contact.contact}
                                        {index < p.InstitutionContacts.length - 1 && ", "}
                                        </span>
                                    ))}
                                    </div>
                                </TableCell>
                                </TableRow>
                            ))
                            */
                            <TableRow>
                                <TableCell colSpan={4} className="h-36 px-6 py-8 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-muted-foreground">
                                    No hay datos disponibles
                                    </p>
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
    const context = useContext(LoginContext);
    const token = context?.tokenJwt ?? undefined;
    const [data, setData] = useState<APIInstitutionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
                </div>
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
