import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import MissingPersonActions from "@/components/MissingPersonActions";
import { ESTADO_PERSONA_COLOR, ESTADO_PERSONA_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DesaparecidoDetailPage({ params }: { params: { id: string } }) {
  const [person, session] = await Promise.all([
    prisma.missingPerson.findUnique({ where: { id: params.id } }),
    getSession(),
  ]);
  if (!person) notFound();

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <span className="badge" style={{ background: ESTADO_PERSONA_COLOR[person.estado] }}>
        {ESTADO_PERSONA_LABELS[person.estado]}
      </span>

      {person.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.fotoUrl} alt={person.nombreCompleto} className="rounded-xl w-full max-h-96 object-cover" />
      ) : (
        <div className="rounded-xl h-64 w-full bg-slate-100 flex items-center justify-center text-6xl">🧑</div>
      )}

      <h1 className="text-2xl font-bold">{person.nombreCompleto}</h1>
      <dl className="text-sm grid grid-cols-2 gap-2">
        {person.identificacion && (
          <>
            <dt className="text-slate-500">Identificación</dt>
            <dd>{person.identificacion}</dd>
          </>
        )}
        {person.edad && (
          <>
            <dt className="text-slate-500">Edad</dt>
            <dd>{person.edad} años</dd>
          </>
        )}
        {person.genero && (
          <>
            <dt className="text-slate-500">Género</dt>
            <dd>{person.genero}</dd>
          </>
        )}
        <dt className="text-slate-500">Ciudad</dt>
        <dd>{person.ciudad}</dd>
        {person.direccion && (
          <>
            <dt className="text-slate-500">Dirección</dt>
            <dd>{person.direccion}</dd>
          </>
        )}
        {person.ultimaVezVisto && (
          <>
            <dt className="text-slate-500">Última vez visto</dt>
            <dd>{person.ultimaVezVisto}</dd>
          </>
        )}
      </dl>

      {person.descripcion && (
        <div>
          <h3 className="font-semibold">Descripción</h3>
          <p className="text-sm whitespace-pre-wrap">{person.descripcion}</p>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold">Contacto de quien reporta</h3>
        <p className="text-sm">{person.reportadoPorNombre} · {person.reportadoPorTelefono}</p>
      </div>

      {session && <MissingPersonActions id={person.id} />}
      {!session && (
        <p className="text-sm text-slate-500">
          ¿Tienes información? Llama al contacto de arriba. Para actualizar el estado, <a href="/login" className="text-red-600 font-semibold">inicia sesión</a>.
        </p>
      )}
    </div>
  );
}
