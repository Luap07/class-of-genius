import React, { useState } from "react";
import {
  HardDrive,
  Save
} from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const StorageSettings = () => {
  const [storage, setStorage] = useState({
    provider: "Firebase Storage",
    maxUploadSize: "100",
    autoBackup: true
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setStorage({
      ...storage,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Storage Settings:", storage);

    // connect storage configuration API here
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Storage Settings
        </h1>

        <p className="text-slate-400 mt-1">
          Configure file storage and upload limits.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        <div className="flex items-center gap-3">

          <HardDrive className="text-blue-400"/>

          <h2 className="text-xl font-semibold">
            Storage Configuration
          </h2>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Storage Provider
          </label>

          <select
            name="provider"
            value={storage.provider}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option>
              Firebase Storage
            </option>

            <option>
              Amazon S3
            </option>

            <option>
              Cloudinary
            </option>

          </select>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Maximum Upload Size (MB)
          </label>

          <input
            name="maxUploadSize"
            value={storage.maxUploadSize}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          />

        </div>


        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-medium">
              Automatic Backup
            </h3>

            <p className="text-sm text-slate-400">
              Backup uploaded files automatically.
            </p>
          </div>


          <input
            type="checkbox"
            name="autoBackup"
            checked={storage.autoBackup}
            onChange={handleChange}
            className="w-5 h-5"
          />

        </div>


        <AdminButton type="submit">

          <span className="flex items-center gap-2">
            <Save size={18}/>
            Save Storage Settings
          </span>

        </AdminButton>


      </form>

    </div>
  );
};

export default StorageSettings;