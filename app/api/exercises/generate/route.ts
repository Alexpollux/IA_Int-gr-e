import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, difficulty, numExercises, exerciseType } = await req.json();
    console.log("Requête reçue :", { difficulty, numExercises, exerciseType, content });

    if (!content || !difficulty || !numExercises || !exerciseType) {
      return NextResponse.json(
        { error: "Tous les champs (contenu, difficulté, nombre d'exercices, type d'exercice) sont requis." },
        { status: 400 }
      );
    }

    const prompt = `
Tu es un assistant pédagogique. Génère ${numExercises} exercices de type "${exerciseType}" avec une difficulté "${difficulty}" basés sur le contenu suivant :
${JSON.stringify(content, null, 2)}

Règles :
- Si le type d'exercice est "QCM", chaque question doit inclure :
  - 4 réponses possibles (dont une seule correcte)
  - Indique laquelle est correcte en tant que "correct_answer".
- Si le type d'exercice est "Questions ouvertes" ou "Exercices pratiques", chaque exercice doit inclure :
  - Une question
  - Une réponse claire et concise
  - Un indice (facultatif) pour aider à trouver la réponse.

Retourne le résultat au format JSON structuré ainsi :
[
  {
    "type": "QCM" | "Questions ouvertes" | "Exercices pratiques",
    "difficulty": "Facile" | "Moyen" | "Difficile",
    "question": "Texte de la question",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Pour QCM uniquement
    "correct_answer": "Texte de la réponse correcte", // Pour QCM uniquement
    "answer": "Texte de la réponse", // Pour Questions ouvertes et Exercices pratiques
    "hint": "Texte de l'indice (facultatif)"
  }
]
`;


    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant qui génère des exercices pédagogiques basés sur un type spécifique.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    });

    const contentResponse = response.choices[0].message?.content;
    console.log("Réponse brute de GPT :", contentResponse);

    if (!contentResponse) {
      return NextResponse.json(
        { error: "Aucune réponse valide de GPT." },
        { status: 500 }
      );
    }

    let parsedResponse;

    try {
      let cleanedContent = contentResponse.trim();

      if (cleanedContent.startsWith("```json") && cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(7, -3).trim();
      } else if (cleanedContent.startsWith("```") && cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(3, -3).trim();
      }

      parsedResponse = JSON.parse(cleanedContent);

      // Si la réponse est un objet contenant une propriété "exercices", utilisez cette propriété
      if (parsedResponse.exercices && Array.isArray(parsedResponse.exercices)) {
        parsedResponse = parsedResponse.exercices;
      }

      if (!Array.isArray(parsedResponse)) {
        throw new Error("La réponse de GPT n'est pas un tableau JSON valide.");
      }

      // Nettoyage des exercices pour s'assurer qu'ils suivent le format attendu
      parsedResponse = parsedResponse.map((exercise) => {
        if (exerciseType === "QCM") {
          const correctAnswerIndex = exercise.options.findIndex(
            (option) => option === exercise.correct_answer
          );
      
          if (correctAnswerIndex === -1) {
            console.warn(
              "Attention : La réponse correcte n'est pas présente dans les options fournies. Correction automatique en cours."
            );
      
            // Assigner une réponse correcte par défaut si absente
            exercise.correct_answer = exercise.options[0]; // Assigner la première option comme réponse correcte
          }
      
          return {
            type: "QCM",
            question: exercise.question,
            options: exercise.options,
            correct_answer: exercise.correct_answer,
          };
        }
      
        return exercise;
      });

      // Validation spécifique pour QCM
      if (exerciseType === "QCM") {
        parsedResponse.forEach((exercise) => {
          if (
            !exercise.options ||
            exercise.options.length !== 4 ||
            !exercise.correct_answer ||
            !exercise.options.includes(exercise.correct_answer)
          ) {
            throw new Error(
              "Les exercices de type QCM doivent inclure 4 réponses possibles et une clé correcte correspondant à l'une des options."
            );
          }
        });
      }

      return NextResponse.json(parsedResponse);
    } catch (error) {
      console.error("Erreur lors du parsing JSON :", error);
      return NextResponse.json(
        { error: "La réponse de GPT n'est pas un JSON valide ou manque de structure." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur dans l'API :", error);
    return NextResponse.json(
      { error: "Erreur inattendue dans le serveur." },
      { status: 500 }
    );
  }
}
