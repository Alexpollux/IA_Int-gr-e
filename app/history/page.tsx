"use client";

import React, { useEffect, useState } from "react";

export default function HistoryPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/save", {
          method: "GET",
        });
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError("Erreur lors de la récupération de l'historique.");
      }
    };
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/save", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setCourses((prev) => prev.filter((course) => course.id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression du cours.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historique des cours</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {courses.length === 0 ? (
        <p>Aucun cours sauvegardé pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course.id} className="border p-4 rounded-lg bg-gray-100">
              <h2 className="text-lg font-bold">{course.title}</h2>
              <p>{course.description}</p>
              <ul className="list-disc pl-6 mt-2">
                {course.objectives.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Supprimer
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Modifier
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
