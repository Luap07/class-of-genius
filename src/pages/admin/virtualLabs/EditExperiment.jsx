import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import ExperimentForm from "../../../components/admin/forms/ExperimentForm";

const EditExperiment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const experiment = {
    title: "Force and Motion Simulation",
    subject: "Physics",
    category: "Mechanics",
    description: "Interactive physics simulation.",
    instructions: "Follow the steps and observe the results.",
    difficulty: "Medium",
    status: "Published"
  };

  const handleSubmit = (data) => {
    console.log("Update Experiment:", id, data);

    // connect API/Firebase here

    navigate("/admin/virtual-labs");
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Edit Experiment
        </h1>

        <p className="text-slate-400 mt-1">
          Update virtual lab experiment details.
        </p>
      </div>

      <ExperimentForm
        initialData={experiment}
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default EditExperiment;