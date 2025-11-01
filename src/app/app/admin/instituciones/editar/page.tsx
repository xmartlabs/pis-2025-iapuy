"use client";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
import EditInstitutionScreen from "@/app/components/instituciones/edit-institution-screen";
import { Skeleton } from "@/components/ui/skeleton";

type APIInstitutionResponse = {
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

export default function EditarInstitucion() {
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("id") ?? "";
  const context = useContext(LoginContext);
  const [data, setData] = useState<APIInstitutionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context || !institutionId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetchWithAuth(
          context,
          `/api/instituciones/${institutionId}`
        );
        if (response.ok) {
          const result =
            (await response.json()) as APIInstitutionResponse;
          setData(result);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching institution:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(() => {});
  }, [context, institutionId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <p>No se pudo cargar la institución</p>
      </div>
    );
  }

  return <EditInstitutionScreen institution={data} />;
}
