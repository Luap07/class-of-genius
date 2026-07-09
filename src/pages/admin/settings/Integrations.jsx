import React, { useState } from "react";
import {
  Save,
  Link
} from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const Integrations = () => {
  const [integrations, setIntegrations] = useState({
    googleAnalytics: "",
    paymentGateway: "Paystack",
    videoProvider: "Cloudinary",
    aiProvider: "Gemini"
  });

  const handleChange = (e) => {
    setIntegrations({
      ...integrations,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Integrations:", integrations);

    // connect integration API here
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Integrations
        </h1>

        <p className="text-slate-400 mt-1">
          Manage external services connected to your platform.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        <div className="flex items-center gap-3">

          <Link className="text-blue-400"/>

          <h2 className="text-xl font-semibold">
            Connected Services
          </h2>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Google Analytics ID
          </label>

          <input
            name="googleAnalytics"
            value={integrations.googleAnalytics}
            onChange={handleChange}
            placeholder="GA-XXXXXXXX"
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          />

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Payment Gateway
          </label>

          <select
            name="paymentGateway"
            value={integrations.paymentGateway}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option>
              Paystack
            </option>

            <option>
              Flutterwave
            </option>

            <option>
              Stripe
            </option>

          </select>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Video Provider
          </label>

          <select
            name="videoProvider"
            value={integrations.videoProvider}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option>
              Cloudinary
            </option>

            <option>
              YouTube API
            </option>

            <option>
              Vimeo
            </option>

          </select>

        </div>


        <div>

          <label className="block text-sm text-slate-400 mb-2">
            AI Provider
          </label>

          <select
            name="aiProvider"
            value={integrations.aiProvider}
            onChange={handleChange}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option>
              Gemini
            </option>

            <option>
              OpenAI
            </option>

          </select>

        </div>


        <AdminButton type="submit">

          <span className="flex items-center gap-2">
            <Save size={18}/>
            Save Integrations
          </span>

        </AdminButton>


      </form>

    </div>
  );
};

export default Integrations;