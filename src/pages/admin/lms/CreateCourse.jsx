import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

/* ================= STEPS ================= */

import BasicInformation from "../../components/admin/courseWizard/BasicInformation";
import ThumbnailMedia from "../../components/admin/courseWizard/ThumbnailMedia";
import CurriculumBuilder from "../../components/admin/courseWizard/CurriculumBuilder";
import LessonsBuilder from "../../components/admin/courseWizard/LessonsBuilder";
import ResourcesBuilder from "../../components/admin/courseWizard/ResourcesBuilder";
import PricingCertificates from "../../components/admin/courseWizard/PricingCertificates";
import SEOSettings from "../../components/admin/courseWizard/SEOSettings";
import ReviewPublish from "../../components/admin/courseWizard/ReviewPublish";

const steps = [
  "Basic",
  "Thumbnail",
  "Curriculum",
  "Lessons",
  "Resources",
  "Pricing",
  "SEO",
  "Publish",
];

const CreateCourse = () => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const previous = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <BasicInformation />;

      case 1:
        return <ThumbnailMedia />;

      case 2:
        return <CurriculumBuilder />;

      case 3:
        return <LessonsBuilder />;

      case 4:
        return <ResourcesBuilder />;

      case 5:
        return <PricingCertificates />;

      case 6:
        return <SEOSettings />;

      case 7:
        return <ReviewPublish />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">
          Create New Course
        </h1>

        <p className="text-slate-400 mt-2">
          Complete every step before publishing.
        </p>

      </div>

      {/* Progress */}

      <div className="grid grid-cols-8 gap-3">

        {steps.map((item, index) => (

          <div
            key={item}
            className={`rounded-2xl p-4 text-center border transition
            ${
              index === step
                ? "bg-blue-600 border-blue-600"
                : index < step
                ? "bg-emerald-600 border-emerald-600"
                : "bg-slate-900 border-slate-800"
            }`}
          >

            <div className="flex justify-center mb-2">

              {index < step ? (
                <CheckCircle2 size={18} />
              ) : (
                <span className="font-bold">
                  {index + 1}
                </span>
              )}

            </div>

            <p className="text-sm">
              {item}
            </p>

          </div>

        ))}

      </div>

      {/* Body */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        {renderStep()}

      </div>

      {/* Footer */}

      <div className="flex justify-between">

        <button
          onClick={previous}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 disabled:opacity-40"
        >
          <ChevronLeft size={18} />

          Previous

        </button>

        <button
          onClick={next}
          disabled={step === steps.length - 1}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 disabled:opacity-40"
        >

          Next

          <ChevronRight size={18} />

        </button>

      </div>

    </div>
  );
};

export default CreateCourse;