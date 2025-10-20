import React, { useEffect, useState, useContext } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";

type Option = { id: string; nombre: string };

type DuplaSelection = {
  ci: string;
  perro: string;
  key: string;
};

type ResultObject = {
  intervention: string;
  acompaniantes: string[];
  duplas: { ci: string; perro: string }[];
};

export default function InscribirIntervencion({
  intervention,
  duplasCount = 2,
}: Readonly<{
  intervention: string;
  duplasCount?: number;
}>) {
  const [guides, setGuides] = useState<Option[]>([]);
  const [perros, setPerros] = useState<Option[]>([]);
  const [acompaniantes, setAcompaniantes] = useState<Option[]>([]);
  const [duplasCountState, setDuplasCountState] = useState<number>(duplasCount);
  const context = useContext(LoginContext);

  const [selectedAcomp, setSelectedAcomp] = useState<string[]>([]);
  const [duplas, setDuplas] = useState<DuplaSelection[]>([]);

  const router = useRouter();

  useEffect(() => {
    const callApi = async () => {
      try {
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const url = `/api/intervention/inscription?id=${encodeURIComponent(
          intervention ?? ""
        )}`;

        let response = await fetch(url, { headers: baseHeaders });

        if (response.status === 401) {
          const resp2 = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Accept: "application/json" },
          });
          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;
            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken?.(newToken);

              response = await fetch(url, {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              });

              if (!response.ok) {
                const txt = await response.text().catch(() => "");
                const suffix = txt ? ` - ${txt}` : "";
                throw new Error(
                  `API ${response.status}: ${response.statusText}${suffix}`
                );
              }
            }
          }
        }

        if (!response.ok) {
          const txt = await response.text().catch(() => "");
          const suffix = txt ? ` - ${txt}` : "";
          throw new Error(
            `API ${response.status}: ${response.statusText}${suffix}`
          );
        }

        const ct = response.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) {
          throw new Error("Expected JSON response from inscription endpoint");
        }

        const body = (await response.json()) as {
          pairsQuantity?: number;
          people?: { ci: string; nombre: string }[];
          perros?: { id: string; nombre: string }[];
        } | null;

        const pairs = body?.pairsQuantity ?? duplasCount;
        const people = body?.people ?? [];
        const perrosData = body?.perros ?? [];

        setGuides(people.map((p) => ({ id: String(p.ci), nombre: p.nombre })));
        setAcompaniantes(
          people.map((p) => ({ id: String(p.ci), nombre: p.nombre }))
        );
        setPerros(
          perrosData.map((p) => ({ id: String(p.id), nombre: p.nombre }))
        );
        setDuplasCountState(pairs);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch inscription options:", err);
      }
    };
    callApi().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }, [intervention, context, duplasCount]);

  useEffect(() => {
    const initial: DuplaSelection[] = [];
    for (let i = 0; i < duplasCountState; i++) {
      initial.push({
        ci: "",
        perro: "",
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      });
    }
    setDuplas(initial);
  }, [duplasCountState]);

  function setDuplaValue(
    index: number,
    key: keyof DuplaSelection,
    value: string
  ) {
    setDuplas((prev) => {
      const copy = prev.map((d) => ({ ...d }));
      copy[index][key] = value;
      return copy;
    });
  }

  function availablePeopleForIndex(index: number) {
    const selectedCis = new Set<string>([
      ...duplas.map((d) => d.ci).filter(Boolean),
      ...selectedAcomp,
    ]);

    const currentCi = duplas[index]?.ci ?? "";
    return guides.filter((g) => g.id === currentCi || !selectedCis.has(g.id));
  }

  function availableAcompanantes() {
    const selectedCis = new Set<string>(
      duplas.map((d) => d.ci).filter(Boolean)
    );
    return acompaniantes.filter((a) => !selectedCis.has(a.id));
  }

  function availablePerrosForIndex(index: number) {
    const selectedPerros = new Set<string>(
      duplas.map((d) => d.perro).filter(Boolean)
    );
    const currentPerro = duplas[index]?.perro ?? "";
    return perros.filter(
      (p) => p.id === currentPerro || !selectedPerros.has(p.id)
    );
  }

  function buildResult(): ResultObject {
    const dupRes: DuplaSelection[] = [];
    for(const d of duplas){
      if(d.perro && d.ci)
        dupRes.push(d);
    }
    return {
      intervention,
      acompaniantes: selectedAcomp,
      duplas: dupRes.map((d) => ({ ci: d.ci || "", perro: d.perro || "" })),
    };
  }

  async function handleSave() {
    try {
      let insc = false;
      for (const d of duplas) {
        if (d.ci && d.perro) {
          insc = true;
          continue;
        }
        if(d.ci) {
          toast.error(
            "Fallo: Debe incluir al perro.",
            {
              duration: 5000,
            }
          );
          return; 
        }
        if(d.perro){
          toast.error(
            "Fallo: Debe incluir al guía",
            {
              duration: 5000,
            }
          );
        }
      }
      if(!insc && selectedAcomp.length > 0) insc = true;
      if(!insc){
        toast.error(
          "Fallo: Debe haber al menos 1 inscripción",
          {
            duration: 5000,
          }
        );
        return;
      }

      if (!intervention) {
        toast.error("Fallo: Falta id de la intervención.", {
          duration: 5000,
        });
        return;
      }

      const result = buildResult();

      const body = JSON.stringify(result);

      const token = context?.tokenJwt;
      const baseHeaders: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let res = await fetch(`/api/intervention/inscription`, {
        method: "POST",
        headers: baseHeaders,
        body,
      });

      if (res.status === 401) {
        const resp2 = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        if (resp2.ok) {
          const refreshBody = (await resp2.json().catch(() => null)) as {
            accessToken?: string;
          } | null;
          const newToken = refreshBody?.accessToken ?? null;
          if (newToken) {
            context?.setToken?.(newToken);

            res = await fetch(`/api/intervention/inscription`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              body,
            });
          }
        }
      }

      if (res.ok) {
        toast.success("Inscripción realizada con éxito.", {
          duration: 5000,
        });
        router.push("/app/colaboradores/intervenciones/listado");
        return;
      }

      let errMsg = await res.text().catch(() => "");
      try {
        const json = JSON.parse(errMsg) as {
          error?: string;
          message?: string;
        } | null;
        if (json?.error) errMsg = json.error;
        else if (json?.message) errMsg = json.message;
      } catch {
        // leave text as-is
      }

      toast.error(`Fallo: ${errMsg || res.statusText}`, {
        duration: 5000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Fallo: ${message}`, {
        duration: 5000,
      });
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duplas */}
        {duplas.map((d, idx) => (
          <Card key={d.key} className="border-[#bdd7b3]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Dupla {idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Guía</Label>
                  <Select
                    value={duplas[idx].ci}
                    onValueChange={(v) => {
                      setDuplaValue(idx, "ci", v);
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Selecciona un guía" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeopleForIndex(idx).map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {`${g.nombre} (${g.id})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs mt-2 text-gray-600">
                    Responsable de acompañar al perro en todo momento.
                  </p>
                </div>

                <div>
                  <Label className="text-sm">Perro</Label>
                  <Select
                    value={duplas[idx].perro}
                    onValueChange={(v) => {
                      setDuplaValue(idx, "perro", v);
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Selecciona un perro" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePerrosForIndex(idx).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Acompañantes card - full width on small screens */}
        <div className="md:col-span-2">
          <Card className="border-[#bdd7b3]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Acompañantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Responsables de sacar fotos y asistir al Guía en lo que
                necesite.
              </p>
              <div>
                <Label className="text-sm">Acompañante</Label>
                <MultiSelect className="w-1/2 mt-2 placeholder:text-gray-100"
                  options={availableAcompanantes().map((a) => (
                    { value: a.id, label: `${a.nombre} (${a.id})` }
                  ))}
                  selected={selectedAcomp}
                  onChange={(v) => { setSelectedAcomp(v); }}
                  placeholder="Selecciona un o más acompañantes"
                  />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button
          className="bg-[#5b9b40]"
          onClick={() => {
            handleSave().catch(() => {});
          }}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
