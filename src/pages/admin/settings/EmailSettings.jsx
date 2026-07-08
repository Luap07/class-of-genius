import React, { useState } from "react";
import {
  Mail,
  Save,
  Send,
  Server,
  Bell,
} from "lucide-react";


const EmailSettings = () => {

  const [settings, setSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    senderName: "Class Of Genius",
    senderEmail: "noreply@classofgenius.com",
    emailNotifications: true,
    welcomeEmail: true,
    resultEmail: true,
  });


  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };


  const saveSettings = () => {
    console.log("Email Settings:", settings);
  };


  const sendTestEmail = () => {
    console.log("Test email sent");
  };


  return (
    <div className="p-6 text-white">

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail />
          Email Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Configure platform email delivery and notifications
        </p>
      </div>


      <div className="max-w-4xl space-y-5">


        {/* SMTP */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
            <Server size={20}/>
            SMTP Configuration
          </h2>


          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={settings.smtpHost}
              onChange={(e)=>updateSetting("smtpHost",e.target.value)}
              placeholder="SMTP Host"
              className="input-style"
            />

            <input
              value={settings.smtpPort}
              onChange={(e)=>updateSetting("smtpPort",e.target.value)}
              placeholder="SMTP Port"
              className="input-style"
            />

          </div>

        </section>



        {/* Sender */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Sender Information
          </h2>


          <div className="space-y-4">

            <input
              value={settings.senderName}
              onChange={(e)=>updateSetting("senderName",e.target.value)}
              placeholder="Sender Name"
              className="input-style"
            />


            <input
              value={settings.senderEmail}
              onChange={(e)=>updateSetting("senderEmail",e.target.value)}
              placeholder="Sender Email"
              className="input-style"
            />

          </div>

        </section>




        {/* Notifications */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
            <Bell size={20}/>
            Email Notifications
          </h2>


          <div className="space-y-4">


            {[
              ["emailNotifications","Enable Email Notifications"],
              ["welcomeEmail","Send Welcome Emails"],
              ["resultEmail","Send Exam Results"],
            ].map(([key,label])=>(

              <label
              key={key}
              className="flex justify-between items-center"
              >

                <span>
                  {label}
                </span>


                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e)=>
                    updateSetting(
                      key,
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            ))}


          </div>

        </section>





        {/* Actions */}
        <div className="flex gap-3">

          <button
          onClick={sendTestEmail}
          className="
          bg-slate-800
          hover:bg-slate-700
          px-5
          py-3
          rounded-xl
          flex
          items-center
          gap-2
          "
          >
            <Send size={18}/>
            Test Email
          </button>


          <button
          onClick={saveSettings}
          className="
          bg-blue-600
          hover:bg-blue-700
          px-5
          py-3
          rounded-xl
          flex
          items-center
          gap-2
          "
          >
            <Save size={18}/>
            Save Settings
          </button>


        </div>


      </div>


    </div>
  );
};


export default EmailSettings;