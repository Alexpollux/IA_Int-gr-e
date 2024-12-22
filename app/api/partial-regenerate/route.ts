import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
      // Récupérez les données envoyées depuis le front-end
      const { sections, selectedSections } = await req.json();
  
      // Validation des données
      if (!sections || !Array.isArray(sections)) {
        return NextResponse.json(
          { error: "Les sections fournies ne sont pas valides." },
          { status: 400 }
        );
      }
  
      if (!selectedSections || !Array.isArray(selectedSections)) {
        return NextResponse.json(
          { error: "Les sections sélectionnées sont manquantes ou invalides." },
          { status: 400 }
        );
      }
  
      console.log("Sections reçues :", sections);
      console.log("Sections sélectionnées :", selectedSections);
  
      // Créez le prompt pour GPT
      const prompt = `
        Tu es un assistant pédagogique chargé de raffiner un plan de cours. Voici le plan actuel :
        ${JSON.stringify(sections, null, 2)}
  
        Les sections à modifier sont :
        ${selectedSections
          .map(
            (index) => `- Section ${index + 1}: "${sections[index].title}" avec la description "${sections[index].description}"`
          )
          .join("\n")}
  
        Modifie uniquement les sections indiquées tout en gardant les autres inchangées. Le format attendu est un tableau JSON :
        [
          {
            "title": "Nouveau titre",
            "description": "Nouvelle description",
            "objectives": [
              "Objectif pédagogique 1",
              "Objectif pédagogique 2"
            ]
          }
        ]
      `;
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un assistant pédagogique." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
      });
  
      const content = response.choices[0].message?.content;
  
      // Validation et parsing de la réponse de GPT
      if (!content) {
        return NextResponse.json(
          { error: "Aucune réponse valide de GPT." },
          { status: 500 }
        );
      }
  
      try {
        // Diviser les blocs JSON multiples dans la réponse brute
        const jsonBlocks = content.match(/\{[\s\S]*?\}/g); // Trouve tous les objets JSON dans la réponse
        console.log("Sections reçues :", sections);
        console.log("Sections sélectionnées :", selectedSections);

      
        if (!jsonBlocks) {
          throw new Error("La réponse de GPT ne contient pas de JSON valide.");
        }
      
        // Fusionner tous les blocs en un seul tableau d'objets
        const parsedBlocks = jsonBlocks.map((block) => {
          try {
            return JSON.parse(block); // Tente de parser chaque bloc
          } catch (err) {
            console.error("Erreur lors du parsing d'un bloc JSON :", block, err);
            return null; // Ignore les blocs mal formés
          }
        }).filter(Boolean); // Filtrer les blocs non null
      
        if (!Array.isArray(parsedBlocks) || parsedBlocks.length === 0) {
          throw new Error("Aucun bloc JSON valide n'a été trouvé.");
        }
      
        console.log("Blocs JSON parsés avec succès :", parsedBlocks);
      
        return NextResponse.json(parsedBlocks); // Retourner le tableau fusionné
      } catch (parseError) {
        console.error("Erreur lors du parsing JSON :", parseError);
        return NextResponse.json(
          { error: "La réponse de GPT n'est pas un JSON valide ou un tableau." },
          { status: 500 }
        );
      }
      
    } catch (error) {
      console.error("Erreur API GPT :", error);
      return NextResponse.json(
        { error: "Erreur inattendue lors de la régénération." },
        { status: 500 }
      );
    }
  }
  
