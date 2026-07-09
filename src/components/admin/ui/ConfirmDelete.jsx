import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDelete = ({
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  onConfirm,
  onCancel
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md">

      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
          <AlertTriangle size={24} />
        </div>

        <h2 className="text-xl font-semibold">
          {title}
        </h2>
      </div>

      <p className="text-slate-400 mb-6">
        {message}
      </p>

      <div className="flex justify-end gap-3">

        <button
          onClick={onCancel}
          className="
            px-4
            py-2
            rounded-xl
            bg-slate-700
            hover:bg-slate-600
          "
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="
            px-4
            py-2
            rounded-xl
            bg-red-600
            hover:bg-red-500
          "
        >
          Delete
        </button>

      </div>

    </div>
  );
};

export default ConfirmDelete;