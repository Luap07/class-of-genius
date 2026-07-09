import React from "react";
import { useNavigate } from "react-router-dom";

import ExperimentForm from "../../../components/admin/forms/ExperimentForm";

const AddExperiment = () => {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log("Create Experiment:", data);

    // connect API/Firebase here

    navigate("/admin/virtual-labs");
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Add Experiment
        </h1>

        <p className="text-slate-400 mt-1">
          Create a new virtual laboratory experiment.
        </p>
      </div>

      <ExperimentForm
        onSubmit={handleSubmit}
      />

    </div>
  );
};

export default AddExperiment;