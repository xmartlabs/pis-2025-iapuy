import type { UsrDogIntervention } from "./types";

export default function Dogs({ dogs }: { dogs: UsrDogIntervention[] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-[#1B2F13]">Perros</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[96px]">
        {dogs &&
          dogs.map((dog) => (
            <div
              key={dog.Perro.id}
              className="p-4 rounded-lg bg-white border border-[#BDD7B3] flex flex-col gap-2 justify-center"
            >
              <p className="text-xs leading-4 font-light uppercase">
                ¿Cómo se sintió {dog.Perro.nombre}?
              </p>
              <p>
                {dog.Perro.DogExperiences.map((exp) => exp.experiencia).join(
                  ", "
                )}
              </p>
            </div>
          ))}
      </div>
    </section>
  );
}
