"use client";

export default function EditSections({
  sections,
  setSections,
}: {
  sections: { title: string; description: string }[];
  setSections: (updatedSections: { title: string; description: string }[]) => void;
}) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Édition et Personnalisation :</h2>
      {sections.map((section, index) => (
        <div key={index} className="mb-4 border p-4 rounded-lg bg-gray-50">
          <input
            type="text"
            value={section.title}
            onChange={(e) => {
              const updatedSections = [...sections];
              updatedSections[index].title = e.target.value;
              setSections(updatedSections);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 mb-2"
            placeholder="Titre"
          />
          <textarea
            value={section.description}
            onChange={(e) => {
              const updatedSections = [...sections];
              updatedSections[index].description = e.target.value;
              setSections(updatedSections);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
          />
          <button
            onClick={() => {
              const updatedSections = sections.filter((_, i) => i !== index);
              setSections(updatedSections);
            }}
            className="mt-2 bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600"
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        onClick={() => setSections([...sections, { title: "", description: "" }])}
        className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
      >
        Ajouter une Section
      </button>
    </div>
  );
}
