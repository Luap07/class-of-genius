import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const subjects = [
  "Math", "English", "Physics", "Chemistry",
  "Biology", "Economics", "Government", "Literature",
  "Geography", "Commerce", "Civic Education", "Agricultural Science",
  "Further Mathematics", "Health Education", 
  "Financial Accounting", "Business Management","Book Keeping",
  "History","Christian Religious Studies","Islamic Studies",
  "French","Igbo","Yoruba","Music","Visual Art","Visual Art",
  "Technical Drawing","Foods and Nutrition","Home Management","Animal Husbandry",

];

const SubjectSelect = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggle = (sub) => {
    if (selected.includes(sub)) {
      setSelected(selected.filter(s => s !== sub));
    } else {
      if (selected.length < 4) {
        setSelected([...selected, sub]);
      }
    }
  };

  const startExam = () => {
    localStorage.setItem("cbt_subjects", JSON.stringify(selected));
    navigate("/cbt/quiz");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl mb-4">
        Select 4 Subjects ({selected.length}/4)
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subjects.map(sub => (
          <div
            key={sub}
            onClick={() => toggle(sub)}
            className={`p-3 rounded cursor-pointer ${
              selected.includes(sub)
                ? "bg-blue-600"
                : "bg-white/10"
            }`}
          >
            {sub}
          </div>
        ))}
      </div>

      <button
        disabled={selected.length !== 4}
        onClick={startExam}
        className="mt-6 px-6 py-3 bg-green-600 rounded disabled:opacity-40"
      >
        Start Exam
      </button>
    </div>
  );
};

export default SubjectSelect;