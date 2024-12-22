import { NextResponse } from "next/server";

// Stockage temporaire (en mémoire)
let savedCourses: any[] = [];

export async function POST(req: Request) {
  try {
    const course = await req.json();
    course.id = `${Date.now()}`; // Générer un ID unique
    savedCourses.push(course);
    return NextResponse.json({ success: true, id: course.id });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la sauvegarde du cours." }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json(savedCourses);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des cours." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    savedCourses = savedCourses.filter((course) => course.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression du cours." }, { status: 500 });
  }
}
