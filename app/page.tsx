"use client";

import { useState } from "react";
import ExportImport from "./components/ExportImport";
import EditSections from "./components/EditSections";

export default function Home() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Débutant");
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<{ title: string; description: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

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

        // Transformer le résultat en sections (exemple basique)
        setSections([
          { title: "Introduction", description: "Description de l'introduction." },
          { title: "Partie 1", description: "Description de la partie 1." },
          { title: "Conclusion", description: "Description de la conclusion." },
        ]);
      } else {
        setResult(`Erreur : ${data.error}`);
      }
    } catch (error) {
      setResult(`Erreur : ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Génération Automatique de Cours</h1>

        {/* Formulaire pour générer un cours */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sujet :</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Exemple : Mathématiques"
              required
            />
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
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Exemple : 2 heures"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Génération en cours..." : "Générer"}
          </button>
        </form>

        {/* Résultat généré */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Résultat :</h2>
          <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">{result}</pre>
        </div>

        {/* Exportation et Importation */}
        <ExportImport
          result={result}
          onImport={(content) => {
            setResult(content);
            // Exemple simple pour définir des sections après import
            setSections([
              { title: "Introduction", description: "Section importée." },
              { title: "Partie 1", description: "Description de la partie importée." },
            ]);
          }}
        />

        {/* Édition des Sections */}
        <EditSections
          sections={sections}
          setSections={setSections}
        />
      </div>
    </div>
  );
}
