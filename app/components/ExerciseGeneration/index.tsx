import React, { useState } from "react";

export default function ExerciseGeneration({ content }: { content: any[] }) {
  const [difficulty, setDifficulty] = useState("Facile");
  const [numExercises, setNumExercises] = useState(5);
  const [exerciseType, setExerciseType] = useState("QCM");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<any[] | null>(null);
  const [showAnswers, setShowAnswers] = useState(false); // État pour afficher ou cacher les réponses

  const handleGenerateExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/exercises/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          difficulty,
          numExercises,
          exerciseType,
        }),
      });

      const exercises = await response.json();

      if (!response.ok) {
        throw new Error(exercises.error || "Une erreur est survenue.");
      }

      setGeneratedExercises(exercises);
    } catch (err) {
      setError(err.message || "Erreur lors de la génération des exercices.");
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher la section tant que le cours n'est pas généré
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Génération d'Exercices</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Difficulté :</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="Facile">Facile</option>
          <option value="Moyen">Moyen</option>
          <option value="Difficile">Difficile</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Nombre d'exercices :</label>
        <input
          type="number"
          value={numExercises}
          onChange={(e) => setNumExercises(Number(e.target.value))}
          className="w-full border rounded-lg px-4 py-2"
          min={1}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Type d'exercice :</label>
        <select
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="QCM">QCM</option>
          <option value="Questions ouvertes">Questions ouvertes</option>
          <option value="Exercices pratiques">Exercices pratiques</option>
        </select>
      </div>

      <button
        onClick={handleGenerateExercises}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Génération en cours..." : "Générer les exercices"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {generatedExercises && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">Exercices générés :</h3>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            {showAnswers ? "Cacher les réponses" : "Afficher les réponses"}
          </button>
          <ul className="space-y-4">
            {generatedExercises.map((exercise, index) => (
              <li key={index} className="border p-4 rounded-lg bg-gray-100">
                <h4 className="font-semibold mb-2">{exercise.question}</h4>

                {exercise.type === "QCM" && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Options :</p>
                    <ul className="list-disc pl-6">
                      {exercise.options.map((option, optionIndex) => (
                        <li key={optionIndex} className="text-sm">
                          {option}
                        </li>
                      ))}
                    </ul>
                    {showAnswers && (
                      <p className="text-sm mt-2 text-green-600">
                        <strong>Réponse correcte :</strong> {exercise.correct_answer}
                      </p>
                    )}
                  </div>
                )}

                {(exercise.type === "Questions ouvertes" || exercise.type === "Exercices pratiques") && showAnswers && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      <strong>Réponse :</strong> {exercise.answer || "Non spécifiée"}
                    </p>
                    {exercise.hint && (
                      <p className="text-sm text-gray-500">
                        <strong>Indice :</strong> {exercise.hint}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
