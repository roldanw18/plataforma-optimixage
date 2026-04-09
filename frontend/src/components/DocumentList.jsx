export default function DocumentList({ documentos }) {
  if (!documentos.length)
    return <p className="text-gray-400 text-sm">No hay documentos en este proyecto.</p>

  return (
    <ul className="space-y-2">
      {documentos.map((doc) => (
        <li key={doc.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <div>
            <p className="font-medium text-gray-800">{doc.titulo}</p>
            {doc.descripcion && <p className="text-sm text-gray-500">{doc.descripcion}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${doc.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {doc.estado}
            </span>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              Ver
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
