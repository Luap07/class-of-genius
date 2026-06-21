import React from "react";
import { useParams } from "react-router-dom";

const CBTExam = () => {
  const { exam, subject } = useParams();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1>
        {exam} - {subject}
      </h1>
    </div>
  );
};

export default CBTExam;