// src/components/ui/Notebook.jsx

import React, { useEffect, useState } from "react";
import {
  NotebookPen,
  Save,
  Trash2,
  Download,
  Copy,
  Check,
} from "lucide-react";

const Notebook = ({
  experiment = "Acid-Base Titration",
  acid = "Hydrochloric Acid (HCl)",
  base = "Sodium Hydroxide (NaOH)",
  indicator = "Phenolphthalein",
  acidConcentration = 0.1,
  baseConcentration = 0.1,
  acidVolume = 25,
  endpointVolume = 25,
  ph = 7,
  observations = "",
}) => {
  const STORAGE_KEY = "titration-lab-notebook";

  const defaultText = `Experiment: ${experiment}

Acid:
${acid}

Base:
${base}

Indicator:
${indicator}

Acid Concentration:
${acidConcentration} M

Base Concentration:
${baseConcentration} M

Initial Acid Volume:
${acidVolume} mL

Calculated Endpoint:
${endpointVolume.toFixed(2)} mL

Final pH:
${ph}

-------------------------------------

Observations

${observations}

-------------------------------------

Conclusion

`;

  const [notes, setNotes] = useState(defaultText);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);

    if (existing) {
      setNotes(existing);
    }
  }, []);

  useEffect(() => {
    setNotes((previous) => {
      if (previous.trim() === "") return defaultText;
      return previous;
    });
    // eslint-disable-next-line
  }, [
    experiment,
    acid,
    base,
    indicator,
    acidConcentration,
    baseConcentration,
    acidVolume,
    endpointVolume,
    ph,
  ]);

  const saveNotes = () => {
    localStorage.setItem(STORAGE_KEY, notes);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const clearNotes = () => {
    if (!window.confirm("Clear notebook?")) return;

    localStorage.removeItem(STORAGE_KEY);

    setNotes(defaultText);
  };

  const copyNotes = async () => {
    await navigator.clipboard.writeText(notes);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1200);
  };

  const exportFile = () => {
    const blob = new Blob([notes], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Titration_Lab_Report.txt";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">

      {/* Header */}

      <div className="flex  justify-between items-center border-b border-slate-800 px-5 py-4">

        <div className="flex  items-center gap-2">

          <NotebookPen
            className="text-cyan-400"
            size={20}
          />

          <h2 className="font-bold text-lg">
            Laboratory Notebook
          </h2>

        </div>

        <div className="flex gap-2">

          <button
            onClick={saveNotes}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <Save size={18} />
          </button>

          <button
            onClick={copyNotes}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            {saved ? (
              <Check
                size={18}
                className="text-green-400"
              />
            ) : (
              <Copy size={18} />
            )}
          </button>

          <button
            onClick={exportFile}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <Download size={18} />
          </button>

          <button
            onClick={clearNotes}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

      {/* Editor */}

      <div className="p-5">

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          spellCheck={false}
          className="
            w-full
            h-[1300px]
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            p-4
            resize-none
            outline-none
            focus:border-cyan-500
            font-mono
            text-sm
            leading-7
          "
        />

      </div>

      {/* Footer */}

      <div className="border-t border-slate-800 px-5 py-3 flex justify-between items-center">

        <span className="text-slate-400 text-sm">
          {notes.length} characters
        </span>

        <span className="text-cyan-400 text-sm">
          Autosaved locally
        </span>

      </div>

    </div>
  );
};

export default Notebook;