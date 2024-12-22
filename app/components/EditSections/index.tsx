"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

export default function EditSections({
  sections,
  setSections,
}: {
  sections: { title: string; description: string; objectives: string }[];
  setSections: (updatedSections: { title: string; description: string; objectives: string }[]) => void;
}) {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.title === active.id);
    const newIndex = sections.findIndex((section) => section.title === over.id);

    const reorderedSections = arrayMove(sections, oldIndex, newIndex);
    setSections(reorderedSections);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Édition et Personnalisation :</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((section) => section.title)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableItem key={section.title} id={section.title}>
              <div className="mb-4 border p-4 rounded-lg bg-gray-50">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder="Description"
                />
                <textarea
                  value={section.objectives}
                  onChange={(e) => {
                    const updatedSections = [...sections];
                    updatedSections[index].objectives = e.target.value;
                    setSections(updatedSections);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Objectifs"
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
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={() =>
          setSections([...sections, { title: `Section ${sections.length + 1}`, description: "", objectives: "" }])
        }
        className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
      >
        Ajouter une Section
      </button>
    </div>
  );
}
