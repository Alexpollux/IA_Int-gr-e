"use client";

import { useState, useEffect } from "react";
import EditSections from "./components/EditSections";
import PartialRegeneration from "./components/PartialRegeneration";
import ExerciseGeneration from "./components/ExerciseGeneration";
import { useSaveContext } from "@/context/SaveContext";

export default function Home() {
  const { savedCourses, saveCourse, deleteCourse } = useSaveContext(); // Utilisation du contexte
  const [subject, setSubject] = useState("Mathématiques");
  const [level, setLevel] = useState("Débutant");
  const [duration, setDuration] = useState("1 heure");
  const [jsonRes, setJsonRes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"none" | "content" | "order">("none");
  const [partialMode, setPartialMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJsonRes([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, level, duration }),
      });

      const data = await response.json();
      if (response.ok) {
        setJsonRes(data);
        saveCourse(data); // Sauvegarde automatique des cours générés
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (error: any) {
      setError(error.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (jsonRes.length > 0) {
      const blob = new Blob([JSON.stringify(jsonRes, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cours.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedJson = JSON.parse(e.target?.result as string);
          setJsonRes(importedJson);
          setError(null);
        } catch (err) {
          setError("Le fichier JSON est invalide.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExitEditMode = () => {
    setEditMode("none");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Génération Automatique de Cours
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sujet :</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
              <option value="Histoire">Histoire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Niveau :</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Durée :</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="30 minutes">30 minutes</option>
              <option value="1 heure">1 heure</option>
              <option value="2 heures">2 heures</option>
              <option value="3 heures">3 heures</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Génération en cours..." : "Générer"}
          </button>
        </form>

        <div className="flex space-x-4 mt-6">
          <label className="bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600 cursor-pointer">
            Importer un JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportJson}
            />
          </label>
          {jsonRes.length > 0 && (
            <button
              onClick={handleDownloadJson}
              className="bg-green-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-600"
            >
              Télécharger le JSON
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500">
            <strong>Erreur : </strong> {error}
          </div>
        )}

        {jsonRes.length > 0 && editMode === "none" && !partialMode && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Résultat :</h2>
            {jsonRes.map((chapter: any, index: number) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold">{chapter.title}</h3>
                <p>
                  <strong>Description :</strong>{" "}
                  {chapter.description || "Non spécifiée"}
                </p>
                <p>
                  <strong>Objectifs pédagogiques :</strong>{" "}
                  {chapter.objectives.length > 0
                    ? chapter.objectives.join(", ")
                    : "Non spécifiés"}
                </p>
              </div>
            ))}
          </div>
        )}

        {editMode !== "none" && (
          <EditSections
            sections={jsonRes}
            setSections={setJsonRes}
            mode={editMode}
            onExitEditMode={() => setEditMode("none")}
          />
        )}

        {jsonRes.length > 0 && editMode === "none" && !partialMode && (
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setEditMode("content")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Modifier le contenu
            </button>
            <button
              onClick={() => setEditMode("order")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Modifier l'ordre
            </button>
            <button
              onClick={() => setPartialMode(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Regénération Partielle
            </button>
          </div>
        )}

        {partialMode && (
          <PartialRegeneration
            sections={jsonRes}
            setSections={setJsonRes}
            onRegenerate={(updatedSections) => setJsonRes(updatedSections)}
            onExitPartialMode={() => setPartialMode(false)}
          />
        )}

        <ExerciseGeneration content={jsonRes} />

        {/* Section Historique */}
        
        <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-4"
          >
            {showHistory ? "Cacher l'historique des cours" : "Afficher l'historique des cours"}
          </button>

        {showHistory && (
  <div className="mt-6">
    <h2 className="text-xl font-bold mb-4">Historique des cours :</h2>
    {savedCourses.length === 0 ? (
      <p>Aucun cours sauvegardé pour le moment.</p>
    ) : (
      <ul className="space-y-4">
        {savedCourses.map((course) => (
          <li key={course.id} className="border p-4 rounded-lg bg-gray-100">
            <h3 className="font-semibold mb-2">Titre : {course.data?.[0]?.title || "Cours sans titre"}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Description : {course.data?.[0]?.description || "Non spécifiée"}
            </p>
            <ul className="list-disc pl-6">
              <strong>Objectifs :</strong>
              {course.data?.[0]?.objectives?.length > 0 ? (
                course.data[0].objectives.map((objective, index) => (
                  <li key={index} className="text-sm">{objective}</li>
                ))
              ) : (
                <li className="text-sm">Non spécifiés</li>
              )}
            </ul>
            <button
              onClick={() => deleteCourse(course.id)}
              className="text-red-500 mt-2 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)}
      </div>
    </div>
  );
}
