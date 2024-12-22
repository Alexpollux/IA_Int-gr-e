"use client";

import { useState } from "react";
import ExportImport from "./components/ExportImport";
import EditSections from "./components/EditSections";

export default function Home() {
  const [subject, setSubject] = useState("Mathématiques");
  const [level, setLevel] = useState("Débutant");
  const [duration, setDuration] = useState("1 heure");
  const [result, setResult] = useState(""); // Texte brut du cours généré
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<{ title: string; description: string; objectives: string }[]>([]);
  const [editing, setEditing] = useState(false); // Contrôle si l'utilisateur souhaite modifier

  const parseGeneratedContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const parsedSections: { title: string; description: string; objectives: string }[] = [];
    let currentSection: { title: string; description: string; objectives: string } | null = null;

    lines.forEach((line) => {
      if (line.startsWith("- **") && line.endsWith("** :")) {
        if (currentSection) parsedSections.push(currentSection);
        currentSection = {
          title: line.replace(/- \*\*(.+)\*\* :/, "$1").trim(),
          description: "",
          objectives: "",
        };
      } else if (line.startsWith("- **Description :**")) {
        if (currentSection) {
          currentSection.description = line.replace("- **Description :**", "").trim();
        }
      } else if (line.startsWith("- **Objectifs pédagogiques :**")) {
        if (currentSection) {
          currentSection.objectives = line.replace("- **Objectifs pédagogiques :**", "").trim();
        }
      } else if (line.startsWith("- ")) {
        if (currentSection && currentSection.objectives) {
          currentSection.objectives += "\n" + line.replace("- ", "").trim();
        }
      }
    });

    if (currentSection) parsedSections.push(currentSection);

    return parsedSections.map((section) => ({
      ...section,
      description: section.description.trim(),
      objectives: section.objectives.trim(),
    }));
  };

  const updateGeneratedContent = (updatedSections: { title: string; description: string; objectives: string }[]) => {
    const updatedContent = updatedSections
      .map(
        (section) =>
          `- **${section.title}** :\n- **Description :** ${section.description}\n- **Objectifs pédagogiques :** ${section.objectives}`
      )
      .join("\n\n");
    setResult(updatedContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setSections([]);
    setEditing(false);

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
        setResult(data.content);
      } else {
        setResult(`Erreur : ${data.error}`);
      }
    } catch (error) {
      setResult(`Erreur : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    const parsedSections = parseGeneratedContent(result);
    setSections(parsedSections);
    setEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Génération Automatique de Cours</h1>

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
              <option value="Biologie">Biologie</option>
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
              <option value="4 heures">4 heures</option>
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

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Résultat :</h2>
          <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">{result}</pre>

          {!editing && result && (
            <button
              onClick={handleEditClick}
              className="mt-4 bg-green-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-green-600"
            >
              Je souhaite modifier
            </button>
          )}
        </div>

        <ExportImport
          result={JSON.stringify(sections, null, 2)}
          onImport={(content) => {
            try {
              const importedSections = JSON.parse(content);
              setSections(importedSections);
              updateGeneratedContent(importedSections);
            } catch {
              alert("Erreur lors de l'importation !");
            }
          }}
        />

        {editing && (
          <EditSections
            sections={sections}
            setSections={(updatedSections) => {
              setSections(updatedSections);
              updateGeneratedContent(updatedSections);
            }}
          />
        )}
      </div>
    </div>
  );
}
