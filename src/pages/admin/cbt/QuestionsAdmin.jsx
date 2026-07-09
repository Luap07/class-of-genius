import React, { useState } from "react";
import { Plus } from "lucide-react";

import QuestionTable from "../../../components/admin/tables/QuestionTable";
import AdminButton from "../../../components/admin/ui/AdminButton";
import AdminSearch from "../../../components/admin/ui/AdminSearch";

const QuestionsAdmin = () => {
  const [search, setSearch] = useState("");

  const [questions] = useState([
    {
      id: 1,
      text: "What is Newton's first law of motion?",
      subject: "Physics",
      type: "MCQ",
      difficulty: "Easy",
      marks: 1
    },
    {
      id: 2,
      text: "Solve the quadratic equation x² + 5x + 6 = 0",
      subject: "Mathematics",
      type: "MCQ",
      difficulty: "Medium",
      marks: 2
    }
  ]);

  const filteredQuestions = questions.filter((item) =>
    item.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Question Bank
          </h1>

          <p className="text-slate-400 mt-1">
            Create and manage CBT examination questions.
          </p>
        </div>

        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18}/>
            Add Question
          </span>
        </AdminButton>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search questions..."
      />


      <QuestionTable
        questions={filteredQuestions}
        onView={(item) => console.log("View", item)}
        onEdit={(item) => console.log("Edit", item)}
        onDelete={(item) => console.log("Delete", item)}
      />

    </div>
  );
};

export default QuestionsAdmin;