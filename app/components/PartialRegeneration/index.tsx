import React, { useState } from "react";

interface PartialRegenerationProps {
    sections: any[];
    setSections: (sections: any[]) => void;
    onRegenerate: (updatedSections: any[]) => void;
    onExitPartialMode: () => void;
    enableAutoRefinement?: boolean;
  }

const PartialRegeneration: React.FC<PartialRegenerationProps> = ({
  sections,
  setSections,
  onRegenerate,
  onExitPartialMode, // Ajoutez une nouvelle prop pour quitter le mode
}) => {
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawGPTResponse, setRawGPTResponse] = useState<string | null>(null);
  const [autoRefine, setAutoRefine] = useState(false);

  const toggleSection = (index: number) => {
    if (selectedSections.includes(index)) {
      setSelectedSections(selectedSections.filter((i) => i !== index));
    } else {
      setSelectedSections([...selectedSections, index]);
    }
  };

  const handleRegenerate = async (autoRefine: boolean) => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await fetch("/api/partial-regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections,
          selectedSections,
          autoRefine, // Passez cette option au backend
        }),
      });
  
      const updatedSections = await response.json();
  
      if (!response.ok) {
        throw new Error(updatedSections.error || "Une erreur est survenue.");
      }
  
      // Mettez à jour uniquement les sections sélectionnées
      const newSections = sections.map((section, index) =>
        selectedSections.includes(index) ? updatedSections.shift() : section
      );
  
      setSections(newSections);
    } catch (err) {
      setError(err.message || "Erreur lors de la régénération.");
    } finally {
      setLoading(false);
    }
  };
  

  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Regénération Partielle</h2>
      <div className="mb-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={autoRefine}
            onChange={() => setAutoRefine(!autoRefine)}
            className="form-checkbox"
          />
          <span>Activer le raffinement automatique</span>
        </label>
      </div>
      <ul className="space-y-4">
        {sections.map((section, index) => (
          <li key={`section-${index}`} className="border p-4 rounded-lg">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedSections.includes(index)}
                onChange={() => toggleSection(index)}
                className="form-checkbox"
              />
              <span className="font-semibold">{section.title}</span>
            </label>
            <p className="text-sm text-gray-600">
              {section.description || "Aucune description fournie."}
            </p>
          </li>
        ))}
      </ul>
      <button
        onClick={() => handleRegenerate(autoRefine)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        disabled={loading}
      >
        {loading
          ? "Régénération en cours..."
          : autoRefine
          ? "Raffiner les sections sélectionnées"
          : "Régénérer les sections sélectionnées"}
      </button>
      <button
        onClick={onExitPartialMode} // Appelez la fonction pour quitter le mode
        className="mt-4 ml-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        Revenir aux résultats
      </button>

      {rawGPTResponse && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Réponse brute de GPT :</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {rawGPTResponse}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PartialRegeneration;
