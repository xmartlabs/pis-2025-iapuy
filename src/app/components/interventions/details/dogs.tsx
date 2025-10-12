type DogsInterface = {
  name?: string;
  feeling?: string;
  id?: string;
};

export default function Dogs({ dogs }: { dogs: DogsInterface[] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Perros</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dogs.map((dog) => (
          <div
            key={dog.id}
            className="p-6 rounded-lg bg-white shadow-sm border border-[#BDD7B3] flex flex-col justify-center"
          >
            <p className="text-sm font-light text-gray-500 uppercase">
              ¿Cómo se sintió {dog.name} ?
            </p>
            <p className="text-lg font-medium text-gray-700">{dog.feeling}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
