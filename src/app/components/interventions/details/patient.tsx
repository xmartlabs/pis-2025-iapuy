import type { Patient } from "./types";

const InfoCard = ({ patient }: { patient: Patient }) => (
  <div className="p-4 rounded-lg bg-white border border-[#BDD7B3] h-[140px] flex flex-col gap-4">
    <h3 className="mt-2 text-xl font-semibold leadin-7 text-[#1B2F13] tracking-[-0.6px]">
      {patient.nombre}, {patient.edad} años
    </h3>
    <div className="grid grid-cols-2 gap-y-1 text-[#1B2F13]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-light uppercase">Patología</p>
        {patient.Patologia &&
          patient.Patologia.map((p) => (
            <p key={p.id} className="font-medium">
              {p.nombre}
            </p>
          ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-light uppercase">¿Cómo se sintió?</p>
        <p className="font-medium">{patient.experiencia}</p>
      </div>
    </div>
  </div>
);

export default function Pacientes({ patients }: { patients: Patient[] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Pacientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((patient: Patient, index: number) => (
          <InfoCard key={index} patient={patient} />
        ))}
      </div>
    </section>
  );
}
