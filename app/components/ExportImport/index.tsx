"use client";

export default function ExportImport({
  result,
  onImport,
}: {
  result: string;
  onImport: (content: string) => void;
}) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Exportation/Importation :</h2>
      {result && (
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify({ content: result }, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "cours.json";
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 mr-4"
        >
          Exporter en JSON
        </button>
      )}
      <label className="block text-sm font-medium text-gray-700">
        Importer un cours JSON :
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const data = JSON.parse(event.target?.result as string);
                  if (data.content) {
                    onImport(data.content);
                  } else {
                    alert("Fichier JSON invalide !");
                  }
                } catch {
                  alert("Erreur lors de la lecture du fichier JSON !");
                }
              };
              reader.readAsText(file);
            }
          }}
          className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </label>
    </div>
  );
}
