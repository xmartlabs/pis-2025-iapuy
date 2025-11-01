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
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

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
  const [lockedDuplas, setLockedDuplas] = useState<DuplaSelection[]>([]);
  const [lockedAcompIds, setLockedAcompIds] = useState<string[]>([]);
  const [duplasCountState, setDuplasCountState] = useState<number>(duplasCount);
  const context = useContext(LoginContext)!;

  const [selectedAcomp, setSelectedAcomp] = useState<string[]>([]);
  const [duplas, setDuplas] = useState<DuplaSelection[]>([]);

  const router = useRouter();

  const postInscription = React.useCallback(
    async (bodyStr: string) => {
      const res = await fetchWithAuth(
        context,
        `/api/intervention/inscription`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: bodyStr,
        }
      );

      return res;
    },
    [context]
  );

  useEffect(() => {
    const callApi = async () => {
      try {
        const url = `/api/intervention/inscription?id=${encodeURIComponent(
          intervention ?? ""
        )}`;
        const response = await fetchWithAuth(context, url, {
          headers: {
            Accept: "application/json",
          },
        });

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
          duplas?: {
            guia: { ci: string; nombre: string };
            perro: { id: string; nombre: string };
          }[];
          acompaniantes?: { ci: string; nombre: string }[];
        } | null;

        const pairs = body?.pairsQuantity ?? duplasCount;
        const people = body?.people ?? [];
        const perrosData = body?.perros ?? [];
        const duplasData = body?.duplas ?? [];
        const acompData = body?.acompaniantes ?? [];

        const peopleOptions = people.map((p) => ({
          id: String(p.ci),
          nombre: p.nombre,
        }));
        const perrosOptions = perrosData.map((p) => ({
          id: String(p.id),
          nombre: p.nombre,
        }));

        const locked = duplasData.map((d) => ({
          ci: String(d.guia.ci),
          perro: String(d.perro.id),
          key: `locked-${String(d.guia.ci)}-${String(d.perro.id)}`,
        }));

        const lockedAcomps = acompData.map((a) => String(a.ci));

        setGuides(peopleOptions);
        setAcompaniantes(peopleOptions);
        setPerros(perrosOptions);
        setLockedDuplas(locked);
        setLockedAcompIds(lockedAcomps);
        setSelectedAcomp(Array.from(new Set(lockedAcomps)));
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
    const editableCount = Math.max(0, duplasCountState - lockedDuplas.length);
    const initial: DuplaSelection[] = [];

    for (const ld of lockedDuplas) initial.push({ ...ld });

    for (let i = 0; i < editableCount; i++) {
      initial.push({
        ci: "",
        perro: "",
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      });
    }

    setDuplas(initial);
  }, [duplasCountState, lockedDuplas]);

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

  function findPersonName(ci: string) {
    return guides.find((g) => g.id === ci)?.nombre ?? ci;
  }

  function findPerroName(id: string) {
    return perros.find((p) => p.id === id)?.nombre ?? id;
  }

  function buildResult(): ResultObject {
    const editableDuplas = duplas.slice(lockedDuplas.length);
    const dupRes: DuplaSelection[] = [];
    for (const d of editableDuplas) {
      if (d.perro && d.ci) dupRes.push(d);
    }

    const newAcomps = selectedAcomp.filter(
      (id) => !lockedAcompIds.includes(id)
    );

    return {
      intervention,
      acompaniantes: newAcomps,
      duplas: dupRes.map((d) => ({ ci: d.ci || "", perro: d.perro || "" })),
    };
  }

  function validateEditableDuplas() {
    const editableDuplas = duplas.slice(lockedDuplas.length);
    let hasInscription = lockedDuplas.length > 0;
    for (const d of editableDuplas) {
      if (d.ci && d.perro) {
        hasInscription = true;
        continue;
      }
      if (d.ci) return { ok: false, message: "Fallo: Debe incluir al perro." };
      if (d.perro) return { ok: false, message: "Fallo: Debe incluir al guía" };
    }
    if (!hasInscription && selectedAcomp.length > 0) hasInscription = true;
    if (!hasInscription)
      return { ok: false, message: "Fallo: Debe haber al menos 1 inscripción" };
    return { ok: true };
  }

  async function handleSave() {
    try {
      const v = validateEditableDuplas();
      if (!v.ok) {
        toast.error(v.message, { duration: 5000 });
        return;
      }

      if (!intervention) {
        toast.error("Fallo: Falta id de la intervención.", { duration: 5000 });
        return;
      }

      const result = buildResult();
      const body = JSON.stringify(result);

      const res = await postInscription(body);

      if (res.ok) {
        toast.success("Inscripción realizada con éxito.", { duration: 5000 });
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

      toast.error(`Fallo: ${errMsg || res.statusText}`, { duration: 5000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Fallo: ${message}`, { duration: 5000 });
    }
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duplas */}
        {duplas.map((d, idx) => {
          const isLocked = idx < lockedDuplas.length;
          return (
            <Card key={d.key} className="border-[#bdd7b3]">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Dupla {idx + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLocked ? (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm">Guía</Label>
                      <p className="mt-2">{`${findPersonName(d.ci)} (${
                        d.ci
                      })`}</p>
                    </div>
                    <div>
                      <Label className="text-sm">Perro</Label>
                      <p className="mt-2">{findPerroName(d.perro)}</p>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          );
        })}

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
                <MultiSelect
                  className="w-1/2 mt-2 placeholder:text-gray-100"
                  options={availableAcompanantes().map((a) => ({
                    value: a.id,
                    label: `${a.nombre} (${a.id})`,
                  }))}
                  selected={selectedAcomp}
                  onChange={(v) => {
                    const merged = Array.from(
                      new Set([...lockedAcompIds, ...v])
                    );
                    setSelectedAcomp(merged);
                  }}
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
