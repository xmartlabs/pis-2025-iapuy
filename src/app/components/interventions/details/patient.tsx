type Patient = {
  name: string;
  details: { label: string; value: string }[];
};

const InfoCard = ({
  title,
  details,
}: {
  title: string;
  details: { label: string; value: string }[];
}) => (
  <div className="p-4 rounded-lg bg-white shadow-sm border border-[#BDD7B3]">
    <h3 className="text-xl font-bold text-[#1B2F13] mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-y-2 text-gray-700">
      {details.map((detail, index) => (
        <div key={index}>
          <p className="text-sm font-light text-gray-500 uppercase">
            {detail.label}
          </p>
          <p className="text-lg font-medium">{detail.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function Pacientes({ patients }: { patients: Patient[] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Pacientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((patient: Patient, index: number) => (
          <InfoCard
            key={index}
            title={patient.name}
            details={patient.details}
          />
        ))}
      </div>
    </section>
  );
}
