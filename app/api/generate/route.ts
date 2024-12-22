import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { subject, level, duration } = await req.json();

    // Validation des champs reçus
    if (!subject || !level || !duration) {
      return NextResponse.json(
        { error: "Tous les champs (sujet, niveau, durée) sont requis." },
        { status: 400 }
      );
    }

    // Prompt amélioré pour des réponses structurées et cohérentes
    const prompt = `
      Tu es un assistant pédagogique. Crée un plan de cours structuré en utilisant les informations suivantes :
      - Sujet : ${subject}
      - Niveau : ${level}
      - Durée : ${duration}

      Le plan doit suivre ce format :

      # Titre du cours : [Cours de ${subject} pour ${level} - ${duration}]
      
      ## Objectif général :
      [Un paragraphe décrivant l'objectif global du cours]

      ## Sections :
      - **Titre de la section 1** :
        - **Durée :** [Durée de la section, par exemple : 30 minutes]
        - **Description :** [Une brève description du contenu de cette section]
        - **Objectifs pédagogiques :**
          - [Objectif pédagogique 1]
          - [Objectif pédagogique 2]
      - **Titre de la section 2** :
        - **Durée :** [Durée de la section]
        - **Description :** [Une description du contenu de cette section]
        - **Objectifs pédagogiques :**
          - [Objectif pédagogique 1]
          - [Objectif pédagogique 2]

      [Continue avec le même format pour les autres sections...]

      Fin du plan de cours.
    `;

    // Appel à l'API OpenAI pour générer le contenu
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant pédagogique spécialisé dans la création de plans de cours." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0].message?.content || "Pas de contenu généré.";

    // Retourner le contenu généré en JSON
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Erreur lors de la génération :", error);
    return NextResponse.json(
      { error: error.message || "Erreur inattendue lors de la génération du cours." },
      { status: 500 }
    );
  }
}
