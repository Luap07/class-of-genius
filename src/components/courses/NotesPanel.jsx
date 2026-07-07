import React from "react";
import { motion } from "framer-motion";
import {
  StickyNote,
  Save,
  Trash2,
} from "lucide-react";

const NotesPanel = ({
  notes = "",
  setNotes,
}) => {
  const handleSave = () => {
    localStorage.setItem(
      "course_notes",
      notes
    );

    alert("Notes saved successfully.");
  };

  const handleClear = () => {
    setNotes("");

    localStorage.removeItem(
      "course_notes"
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >
      <div className="flex items-center gap-3">

        <StickyNote
          size={28}
          className="text-yellow-400"
        />

        <div>

          <h2 className="text-2xl font-bold">
            My Notes
          </h2>

          <p className="text-slate-400">
            Save important points while studying.
          </p>

        </div>

      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
        className="
          mt-6
          w-full
          h-72
          rounded-2xl
          border
          border-slate-700
          bg-slate-950
          p-5
          resize-none
          outline-none
          focus:border-blue-500
        "
      />

      <div className="flex gap-4 mt-6">

        <button
          onClick={handleSave}
          className="
            flex-1
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            transition
            py-3
            font-semibold
          "
        >
          <Save size={18} />
          Save Notes
        </button>

        <button
          onClick={handleClear}
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-red-600
            hover:bg-red-700
            transition
            px-6
          "
        >
          <Trash2 size={18} />
          Clear
        </button>

      </div>

    </motion.div>
  );
};

export default NotesPanel;