import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function EditSections({
  sections,
  setSections,
  mode,
  onExitEditMode,
}: {
  sections: any[];
  setSections: (updatedSections: any[]) => void;
  mode: "order" | "content";
  onExitEditMode: () => void;
}) {
  const [draftSections, setDraftSections] = useState(
    sections.map((section, index) => ({
      ...section,
      id: section.id || `section-${index}`, // Assure un id unique
    }))
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = draftSections.findIndex((section) => section.id === active.id);
      const newIndex = draftSections.findIndex((section) => section.id === over.id);
      const updatedSections = arrayMove(draftSections, oldIndex, newIndex);
      setDraftSections(updatedSections);
      setSections(updatedSections); // Update parent state
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedSections = [...draftSections];
    updatedSections[index][field] = value;
    setDraftSections(updatedSections);
    setSections(updatedSections); // Update parent state
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section-${draftSections.length}`,
      title: "Nouvelle section",
      description: "",
      objectives: [],
    };
    const updatedSections = [...draftSections, newSection];
    setDraftSections(updatedSections);
    setSections(updatedSections); // Update parent state
  };

  return (
    <div>
      {mode === "order" ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={draftSections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {draftSections.map((section) => (
              <SortableItem key={section.id} id={section.id}>
                <div className="border p-4 mb-4 rounded-lg bg-gray-100">
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  <p>{section.description || "Pas de description"}</p>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        draftSections.map((section, index) => (
          <div key={section.id} className="mb-4 border p-4 rounded-lg bg-gray-100">
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
              placeholder="Titre"
              className="w-full border rounded-lg px-4 py-2 mb-2"
            />
            <textarea
              value={section.description}
              onChange={(e) => handleChange(index, "description", e.target.value)}
              placeholder="Description"
              className="w-full border rounded-lg px-4 py-2 mb-2"
            />
            <textarea
              value={section.objectives.join(", ")}
              onChange={(e) =>
                handleChange(index, "objectives", e.target.value.split(","))
              }
              placeholder="Objectifs (séparés par des virgules)"
              className="w-full border rounded-lg px-4 py-2 mb-2"
            />
          </div>
        ))
      )}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={handleAddSection}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Ajouter une section
        </button>
        <button
          onClick={onExitEditMode}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Sortir de l'édition
        </button>
      </div>
    </div>
  );
}
