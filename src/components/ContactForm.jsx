// src/components/ContactForm.jsx
import React from 'react';

const ContactForm = () => {
  return (
    <section className="px-8 py-20 border-t border-white/10 bg-[#070b14] text-white">
      <h2 className="text-3xl font-bold mb-10 text-center">Contact Us</h2>
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        
        <div className="space-y-4">
          <p className="text-gray-400">
            Have questions about ClassOfGenius? We're here to assist you.
          </p>
          <div className="text-sm">
            <p className="font-semibold text-white">Email</p>
            <p className="text-blue-400">support@classofgenius.com</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            placeholder="Your Name" 
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
          />
          <textarea 
            placeholder="How can we help?" 
            rows="4"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition w-full">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;