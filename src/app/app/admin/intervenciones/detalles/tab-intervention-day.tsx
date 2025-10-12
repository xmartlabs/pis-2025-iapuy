export default function InterventionDay({ shown }: { shown: boolean }) {
  if (!shown) return null;

  return (
    <div>
      <h2>Día de la intervención</h2>
      <p>Detalles sobre el día de la intervención.</p>
    </div>
  );
}
