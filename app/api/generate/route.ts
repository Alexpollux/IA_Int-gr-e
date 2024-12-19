import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Assure-toi que la clé API est bien dans .env.local
});

export async function POST(req: Request) {
  try {
    const { subject, level, duration } = await req.json();

    // Validation des champs
    if (!subject || !level || !duration) {
      return NextResponse.json(
        { error: "Tous les champs (subject, level, duration) sont requis." },
        { status: 400 }
      );
    }

    // Construction du prompt
    const prompt = `Créez un plan de cours structuré pour un cours sur '${subject}' au niveau '${level}' d'une durée de ${duration}. Incluez des sections avec titres, descriptions et objectifs pédagogiques.`;

    // Appel à OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant pédagogique." },
        { role: "user", content: prompt },
      ],
    });

    // Récupération de la réponse
    const content = response.choices[0].message?.content || "Pas de contenu généré.";

    return NextResponse.json({ content });
  } catch (error: any) {
    // Gestion des erreurs
    return NextResponse.json(
      { error: error.message || "Erreur inattendue." },
      { status: 500 }
    );
  }
}
