import Dogs from "./dogs";
import Pacientes from "./patient";
import type { UsrDogIntervention, Patient } from "./types";

export default function InterventionDay({
  shown,
  patients,
  dogs,
  photos,
  link,
}: {
  shown: boolean;
  patients: Patient[];
  dogs: UsrDogIntervention[];
  photos: string[];
  link: string;
}) {
  if (!shown) return null;

  return (
    <div className="py-2 space-y-8 bg-white">
      <Pacientes patients={patients} />

      <Dogs dogs={dogs} />

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Fotos</h2>
        {photos.length > 0 ? (
          <>
            <div className="flex flex-row gap-4">
              <div className="rounded-lg overflow-hidden max-w-[505px] max-h-[308px]">
                <img
                  src={photos[0]}
                  alt="Perro en terapia 1"
                  className="w-full h-auto object-cover"
                  style={{ minHeight: "200px" }}
                />
              </div>
              {photos.length > 1 && (
                <div className="ml-2 rounded-lg overflow-hidden max-w-[505px] max-h-[308px]">
                  <img
                    src={photos[1]}
                    alt="Perro en terapia 2"
                    className="w-full h-auto object-cover"
                    style={{ minHeight: "200px" }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <p>No hay fotos.</p>
        )}

        {link.length > 0 && (
          <p className="mt-4 text-sm">
            <a href={link} className="!text-[#5B9B40] !underline">
              Link a Drive
            </a>
            <span> con más fotos.</span>
          </p>
        )}
      </section>
    </div>
  );
}
