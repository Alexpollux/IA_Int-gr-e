import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction de génération principale
export async function POST(req: Request) {
  try {
    const { subject, level, duration, sections } = await req.json();

    // Validation des champs reçus
    if (!subject && !sections) {
      return NextResponse.json(
        { error: "Les champs (sujet ou sections) sont requis." },
        { status: 400 }
      );
    }

    // Si des sections spécifiques sont fournies pour régénération
    if (sections) {
      const regeneratedSections = await regenerateSections(sections);
      return NextResponse.json(regeneratedSections);
    }

    // Prompt pour générer un JSON structuré
    const prompt = `
      Tu es un assistant pédagogique. Crée un plan de cours structuré en fonction des informations suivantes :
      - Sujet : ${subject}
      - Niveau : ${level}
      - Durée : ${duration}

      Considère qu'une section correspond en moyenne à 30 minutes. Divise la durée totale en plusieurs sections et crée une section par intervalle de 30 minutes. Chaque section doit inclure :
      - Un titre
      - Une description
      - Une liste de 2 à 3 objectifs pédagogiques

      Le format attendu est un JSON structuré, comme suit :
      [
        {
          "title": "Titre de la section",
          "description": "Description de la section",
          "objectives": [
            "Objectif pédagogique 1",
            "Objectif pédagogique 2"
          ]
        },
        ...
      ] 
      Assure-toi que le nombre de sections est proportionnel à la durée totale, et que le contenu reste cohérent et adapté au niveau ${level} et à la durée ${duration}.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant pédagogique qui génère des cours structurés.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0].message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Aucun contenu renvoyé par l'API GPT." },
        { status: 500 }
      );
    }

    try {
      // Nettoyage du contenu pour retirer les parties non-JSON
      const jsonStartIndex = content.indexOf("[");
      const jsonEndIndex = content.lastIndexOf("]") + 1;
      const cleanContent = content.slice(jsonStartIndex, jsonEndIndex);

      return NextResponse.json(JSON.parse(cleanContent)); // Retourne un JSON structuré
    } catch (parseError) {
      console.error("Erreur lors du parsing JSON :", parseError);
      return NextResponse.json(
        { error: "La réponse de GPT n'est pas un JSON valide." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur API GPT :", error);
    return NextResponse.json(
      { error: error.message || "Erreur inattendue lors de la génération." },
      { status: 500 }
    );
  }
}

// Fonction de régénération des sections spécifiques
async function regenerateSections(sections: any[]) {
  try {
    const prompts = sections.map((section) => {
      return `
        Régénère uniquement la section suivante d'un cours structuré :
        - Titre original : ${section.title || "Non spécifié"}
        - Description originale : ${section.description || "Non spécifiée"}
        - Objectifs originaux : ${
          section.objectives
            ? section.objectives.join(", ")
            : "Aucun objectif spécifié"
        }

        Le format attendu est un objet JSON structuré comme suit :
        {
          "title": "Nouveau titre",
          "description": "Nouvelle description",
          "objectives": [
            "Objectif pédagogique 1",
            "Objectif pédagogique 2"
          ]
        }
      `;
    });

    const results = [];

    for (const prompt of prompts) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant pédagogique spécialisé dans la régénération de sections de cours.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0].message?.content;

      if (!content) {
        console.error("Aucun contenu renvoyé par l'API GPT pour une section.");
        results.push(null);
        continue;
      }

      try {
        results.push(JSON.parse(content));
      } catch (parseError) {
        console.error("Erreur lors du parsing JSON :", parseError);
        results.push(null);
      }
    }

    return results.filter((result) => result !== null); // Retourne uniquement les sections valides
  } catch (error) {
    console.error("Erreur lors de la régénération des sections :", error);
    throw new Error("Erreur inattendue lors de la régénération des sections.");
  }
}
