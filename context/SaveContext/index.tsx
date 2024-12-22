"use client";

import React, { createContext, useContext, useState } from "react";

interface Course {
  id: string;
  data: any; // Modifiez cette structure en fonction des données de vos cours
}

interface SaveContextProps {
  savedCourses: Course[];
  saveCourse: (course: any) => void;
  deleteCourse: (id: string) => void;
}

const SaveContext = createContext<SaveContextProps | undefined>(undefined);

export const SaveProvider = ({ children }: { children: React.ReactNode }) => {
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);

  const saveCourse = (course: any) => {
    const newCourse = {
      id: Date.now().toString(),
      data: course,
    };
    setSavedCourses((prev) => [...prev, newCourse]);
  };

  const deleteCourse = (id: string) => {
    setSavedCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <SaveContext.Provider value={{ savedCourses, saveCourse, deleteCourse }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSaveContext = () => {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error("useSaveContext must be used within a SaveProvider");
  }
  return context;
};
