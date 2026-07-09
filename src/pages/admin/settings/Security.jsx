import React, { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const Security = () => {
  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "30"
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setSecurity({
      ...security,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Security Settings:", security);

    // connect backend/API here
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Security Settings
        </h1>

        <p className="text-slate-400 mt-1">
          Manage authentication and platform security options.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
      >

        <div className="flex items-center gap-3">

          <ShieldCheck className="text-blue-400"/>

          <h2 className="text-xl font-semibold">
            Account Protection
          </h2>

        </div>


        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-medium">
              Two Factor Authentication
            </h3>

            <p className="text-sm text-slate-400">
              Add extra protection to admin accounts.
            </p>
          </div>


          <input
            type="checkbox"
            name="twoFactor"
            checked={security.twoFactor}
            onChange={handleChange}
            className="w-5 h-5"
          />

        </div>


        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-medium">
              Login Alerts
            </h3>

            <p className="text-sm text-slate-400">
              Receive alerts for new account logins.
            </p>
          </div>


          <input
            type="checkbox"
            name="loginAlerts"
            checked={security.loginAlerts}
            onChange={handleChange}
            className="w-5 h-5"
          />

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Session Timeout (minutes)
          </label>


          <select
            name="sessionTimeout"
            value={security.sessionTimeout}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option value="15">
              15 Minutes
            </option>

            <option value="30">
              30 Minutes
            </option>

            <option value="60">
              60 Minutes
            </option>

          </select>

        </div>


        <AdminButton type="submit">

          <span className="flex items-center gap-2">
            <Save size={18}/>
            Save Security
          </span>

        </AdminButton>


      </form>

    </div>
  );
};

export default Security;