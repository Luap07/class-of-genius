import React from "react";

import LessonCard from "./LessonCard";

export default function LessonsGrid({
  lessons,
  onEdit,
  onDelete,
}) {
  if (!lessons.length) {
    return null;
  }

  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}