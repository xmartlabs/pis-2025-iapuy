import Dogs from "./dogs";
import Pacientes from "./patient";

const patientsDefault = [
  {
    name: "Paciente 1",
    details: [
      { label: "Edad", value: "30 años" },
      { label: "Género", value: "Femenino" },
      { label: "Diagnóstico", value: "Ansiedad" },
      { label: "Observaciones", value: "Muy participativa" },
    ],
  },
  {
    name: "Paciente 2",
    details: [
      { label: "Edad", value: "45 años" },
      { label: "Género", value: "Masculino" },
      { label: "Diagnóstico", value: "Depresión" },
      { label: "Observaciones", value: "Reservado al inicio" },
    ],
  },
];

const dogsDefault = [
  { name: "Mara", feeling: "Bien", id: "1" },
  { name: "Rex", feeling: "Muy bien", id: "2" },
];

const fotoPerro1 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdgwlLnfdM75IVP2P4kGFgQmJcQMkJEE77RA&s";
const fotoPerro2 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTllv77M4OSNxJfB1WfdPfLEiwIpsawZllbJvAj9d-dO3ITDQk8QSP5lQLiw-WHtrXy40swfN3jRS63sAndHHMQAL6yh7vjJMmdEsHsUqIZxw";

export default function InterventionDay({
  shown,
  patients,
  dogs,
  link,
}: {
  shown: boolean;
  patients: any[];
  dogs: any[];
  link: string;
}) {
  if (!shown) return null;

  return (
    <div className="py-2 space-y-8 bg-white">
      <Pacientes patients={patients.length > 0 ? patients : patientsDefault} />

      <Dogs dogs={dogs.length > 0 ? dogs : dogsDefault} />

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Fotos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-lg overflow-hidden max-w-[480px] max-h-[280px]">
            <img
              src={fotoPerro1}
              alt="Perro en terapia 1"
              className="w-full h-auto object-cover"
              style={{ minHeight: "200px" }}
            />
          </div>

          <div className="rounded-lg overflow-hidden max-w-[480px] max-h-[280px]">
            <img
              src={fotoPerro2}
              alt="Perro en terapia 2"
              className="w-full h-auto object-cover"
              style={{ minHeight: "200px" }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm">
          <a href={link} className="!text-[#5B9B40] !underline">
            Link a Drive
          </a>
          <span> con más fotos.</span>
        </p>
      </section>
    </div>
  );
}
