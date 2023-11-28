export function Overview() {
  return (
    <>
      <div className="bg-gray-100 text-center">
        <h1 className="text-2xl py-3 pl-5">Algebra Interaktion Prototypen</h1>
      </div>
      <div className="flex justify-around mt-12">
        <a
          className="text-4xl px-4 py-5 bg-blue-200 hover:bg-blue-300 rounded"
          href="/terme"
        >
          Terme
        </a>
        <a
          className="text-4xl px-4 py-5 bg-blue-200 hover:bg-blue-300 rounded"
          href="/gleichungen"
        >
          Gleichungen
        </a>
      </div>
    </>
  )
}
