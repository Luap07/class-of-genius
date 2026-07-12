// src/pages/instructor/BecomeInstructorForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  User,
  Briefcase,
  BookOpen,
  Globe,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

/* ================= COUNTRY CODES ================= */
const countryCodes = [
  "+1 United States", "+1 Canada", "+7 Russia", "+20 Egypt", "+27 South Africa", "+30 Greece",
  "+31 Netherlands", "+32 Belgium", "+33 France", "+34 Spain", "+39 Italy", "+40 Romania",
  "+41 Switzerland", "+43 Austria", "+44 United Kingdom", "+45 Denmark", "+46 Sweden",
  "+47 Norway", "+48 Poland", "+49 Germany", "+52 Mexico", "+54 Argentina", "+55 Brazil",
  "+56 Chile", "+57 Colombia", "+60 Malaysia", "+61 Australia", "+62 Indonesia", "+63 Philippines",
  "+64 New Zealand", "+65 Singapore", "+66 Thailand", "+81 Japan", "+82 South Korea",
  "+84 Vietnam", "+86 China", "+90 Turkey", "+91 India", "+92 Pakistan", "+93 Afghanistan",
  "+94 Sri Lanka", "+95 Myanmar", "+98 Iran", "+211 South Sudan", "+212 Morocco", "+213 Algeria",
  "+216 Tunisia", "+218 Libya", "+220 Gambia", "+221 Senegal", "+223 Mali", "+224 Guinea",
  "+225 Ivory Coast", "+226 Burkina Faso", "+227 Niger", "+228 Togo", "+229 Benin", "+230 Mauritius",
  "+231 Liberia", "+232 Sierra Leone", "+233 Ghana", "+234 Nigeria", "+235 Chad",
  "+236 Central African Republic", "+237 Cameroon", "+238 Cape Verde", "+239 São Tomé & Príncipe",
  "+240 Equatorial Guinea", "+241 Gabon", "+242 Congo", "+243 DR Congo", "+244 Angola",
  "+248 Seychelles", "+249 Sudan", "+250 Rwanda", "+251 Ethiopia", "+252 Somalia", "+253 Djibouti",
  "+254 Kenya", "+255 Tanzania", "+256 Uganda", "+257 Burundi", "+258 Mozambique", "+260 Zambia",
  "+261 Madagascar", "+263 Zimbabwe", "+264 Namibia", "+265 Malawi", "+266 Lesotho", "+267 Botswana",
  "+268 Eswatini", "+269 Comoros", "+351 Portugal", "+352 Luxembourg", "+353 Ireland", "+354 Iceland",
  "+355 Albania", "+356 Malta", "+357 Cyprus", "+358 Finland", "+359 Bulgaria", "+370 Lithuania",
  "+371 Latvia", "+372 Estonia", "+380 Ukraine", "+381 Serbia", "+382 Montenegro", "+385 Croatia",
  "+386 Slovenia", "+387 Bosnia", "+389 North Macedonia", "+420 Czech Republic", "+421 Slovakia",
  "+971 United Arab Emirates", "+972 Israel", "+973 Bahrain", "+974 Qatar", "+975 Bhutan",
  "+976 Mongolia", "+977 Nepal", "+966 Saudi Arabia",
];

/* ================= BENEFITS ================= */
const benefits = [
  "Teach thousands of students worldwide",
  "Create premium online courses",
  "Earn passive income",
  "Use AI teaching tools",
  "Build your personal brand",
  "Track student performance",
];

const BecomeInstructorForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", countryCode: "+234 Nigeria", country: "",
    expertise: "", experience: "", education: "", occupation: "",
    courseTitle: "", courseLevel: "", courseDescription: "",
    website: "", linkedin: "", youtube: "",
    teachingExperience: "", availability: "",
    instructorAgreement: false, originalContent: false, qualityStandards: false, terms: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.instructorAgreement || !formData.originalContent || !formData.qualityStandards || !formData.terms) {
      alert("Please accept all agreements.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log(formData);
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full rounded-[35px] border border-slate-800 bg-slate-900 p-12 text-center">
          <CheckCircle2 size={75} className="mx-auto text-blue-500" />
          <h1 className="mt-6 text-4xl font-black">Application Submitted</h1>
          <p className="mt-5 text-slate-400 leading-8">Your instructor application has been submitted successfully. Our review team will contact you after reviewing your profile.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold hover:bg-blue-700">Go To Dashboard</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4">
            <img src={Cog} alt="Scholiqen" className="h-14 w-14" />
            <div className="text-left"><h2 className="text-2xl font-black">Scholiqen</h2><p className="text-sm text-slate-400">Learn • Teach • Inspire</p></div>
          </button>
          <div className="text-center"><h1 className="text-4xl font-black">Become an <span className="text-blue-500">Instructor</span></h1><p className="mt-2 text-slate-400">Share knowledge. Build courses. Inspire learners.</p></div>
          <div className="w-52"></div>
        </div>
      </header>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="rounded-[30px] border border-slate-800 bg-slate-900 p-8">
                <div className="flex items-center gap-4">
                  <img src={Cog} alt="Scholiqen" className="h-16 w-16 object-contain" />
                  <div><h2 className="text-3xl font-black">Scholiqen</h2><p className="text-slate-400 text-sm">Empowering Educators Worldwide</p></div>
                </div>
                <div className="mt-8"><h3 className="text-2xl font-bold leading-tight">Why Teach With <span className="text-blue-500">Scholiqen?</span></h3><p className="mt-4 leading-7 text-slate-400">Reach learners across the world, build premium educational content, grow your professional brand, and earn from your knowledge.</p></div>
              </div>
              <div className="rounded-[30px] border border-slate-800 bg-slate-900 p-8">
                <h3 className="text-xl font-bold">Instructor Benefits</h3>
                <div className="mt-6 space-y-5">
                  {benefits.map((item) => (
                    <div key={item} className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-1 text-blue-500 flex-shrink-0" /><span className="text-slate-300">{item}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <div className="rounded-[35px] border border-slate-800 bg-slate-900 p-8 lg:p-10">
              <div className="mb-10"><h2 className="text-3xl font-black">Instructor Application</h2><p className="mt-3 text-slate-400 leading-7">Complete the information below so we can review your application and verify your instructor profile.</p></div>
              <form onSubmit={handleSubmit} className="space-y-12">
                <FormSection icon={<User size={22} />} title="Personal Information">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Input label="Full Name" placeholder="Enter your full name" name="fullName" value={formData.fullName} onChange={handleChange} />
                    <Input label="Professional Email" type="email" placeholder="Enter your professional email" name="email" value={formData.email} onChange={handleChange} />
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">Phone Number</label>
                      <div className="flex gap-3">
                        <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="w-48 rounded-xl border-2 border-slate-600 bg-slate-950 px-4 py-4 text-white outline-none transition focus:border-blue-500">{countryCodes.map((code) => <option key={code} value={code}>{code}</option>)}</select>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="8012345678" className="field flex-1" />
                      </div>
                    </div>
                    <Input label="Country" placeholder="Nigeria" name="country" value={formData.country} onChange={handleChange} />
                  </div>
                </FormSection>

                <FormSection icon={<Briefcase size={22} />} title="Professional Background">
                  <div className="space-y-6">
                    <Input label="Area of Expertise" placeholder="Web Development, Physics, UI/UX..." name="expertise" value={formData.expertise} onChange={handleChange} />
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input label="Years of Experience" placeholder="5 Years" name="experience" value={formData.experience} onChange={handleChange} />
                      <Input label="Current Occupation" placeholder="Software Engineer" name="occupation" value={formData.occupation} onChange={handleChange} />
                    </div>
                    <Input label="Education / Certifications" placeholder="B.Sc Computer Science, AWS, Cisco..." name="education" value={formData.education} onChange={handleChange} />
                  </div>
                </FormSection>

                <FormSection icon={<BookOpen size={22} />} title="Course Information">
  <div className="space-y-6">

    <Input
      label="Course Title"
      placeholder="e.g. Complete React Masterclass"
      name="courseTitle"
      value={formData.courseTitle}
      onChange={handleChange}
    />

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Course Level
      </label>

      <select
        name="courseLevel"
        value={formData.courseLevel}
        onChange={handleChange}
        className="
          w-full
          rounded-xl
          border-2
          border-slate-600
          bg-slate-950
          px-5
          py-4
          text-white
          outline-none
          transition-all
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/20
        "
      >
        <option value="" className="bg-slate-950 text-slate-400">
          Select Course Level
        </option>

        <option value="Beginner" className="bg-slate-950 text-white">
          Beginner
        </option>

        <option value="Intermediate" className="bg-slate-950 text-white">
          Intermediate
        </option>

        <option value="Advanced" className="bg-slate-950 text-white">
          Advanced
        </option>

        <option value="Expert" className="bg-slate-950 text-white">
          Expert
        </option>
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Course Description
      </label>

      <textarea
        rows={6}
        name="courseDescription"
        value={formData.courseDescription}
        onChange={handleChange}
        placeholder="Describe what students will learn from this course..."
        className="
          w-full
          rounded-xl
          border-2
          border-slate-600
          bg-slate-950
          px-5
          py-4
          text-white
          placeholder:text-slate-400
          outline-none
          transition-all
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/20
          resize-none
        "
      />
    </div>

  </div>
</FormSection>

                <FormSection icon={<Globe size={22} />} title="Online Presence">
                  <div className="space-y-6">
                    <Input label="Website" placeholder="https://yourwebsite.com" name="website" value={formData.website} onChange={handleChange} />
                    <Input label="LinkedIn Profile" placeholder="https://linkedin.com/in/yourname" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                    <Input label="YouTube Channel" placeholder="https://youtube.com/@yourchannel" name="youtube" value={formData.youtube} onChange={handleChange} />
                  </div>
                </FormSection>

                <FormSection icon={<Award size={22} />} title="Teaching Experience">
                  <div className="space-y-6">
                    <div><label className="mb-2 block text-sm font-semibold text-slate-300">Previous Teaching Experience</label><textarea rows={6} name="teachingExperience" value={formData.teachingExperience} onChange={handleChange} placeholder="Tell us about your teaching, mentoring, bootcamps, workshops or tutoring experience..." className="field resize-none" /></div>
                    <div><label className="mb-2 block text-sm font-semibold text-slate-300">Availability</label><select name="availability" value={formData.availability} onChange={handleChange} className="field"><option value="">Select Availability</option><option>Full Time</option><option>Part Time</option><option>Weekends Only</option><option>Evenings Only</option><option>Flexible</option></select></div>
                  </div>
                </FormSection>

                <section className="space-y-6">
                  <div><h3 className="text-2xl font-black">Instructor Agreement</h3><p className="mt-2 text-slate-400">Before submitting your application, please review and accept the following agreements.</p></div>
                  <AgreementCard name="instructorAgreement" checked={formData.instructorAgreement} onChange={handleChange} title="Instructor Code of Conduct" description="I agree to follow Scholiqen's instructor policies, code of conduct, and maintain a professional learning environment." />
                  <AgreementCard name="originalContent" checked={formData.originalContent} onChange={handleChange} title="Original Content Declaration" description="I certify that all videos, documents, quizzes, and teaching materials I upload are my own or I have permission to use them." />
                  <AgreementCard name="qualityStandards" checked={formData.qualityStandards} onChange={handleChange} title="Quality Assurance" description="I agree to provide high-quality educational content and keep my courses updated when necessary." />
                  <AgreementCard name="terms" checked={formData.terms} onChange={handleChange} title="Terms & Privacy Policy" description="I have read and agree to Scholiqen's Terms of Service and Privacy Policy." />
                </section>

                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-bold transition hover:bg-blue-700 disabled:opacity-60">{loading ? "Submitting Application..." : <><Send size={22} /> Submit Instructor Application</>}</button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Input = ({ label, placeholder, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
    <input {...props} placeholder={placeholder} required className="field w-full rounded-xl border-2 border-slate-700 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-all" />
  </div>
);

const FormSection = ({ icon, title, children }) => (
  <section>
    <div className="mb-8 flex items-center gap-3">
      <div className="rounded-xl bg-blue-600/10 p-3 text-blue-500">{icon}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
    {children}
  </section>
);

const AgreementCard = ({ name, checked, onChange, title, description }) => (
  <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all ${checked ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="mt-1 h-5 w-5 accent-blue-600" />
    <div><h4 className="font-bold text-white">{title}</h4><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></div>
  </label>
);

export default BecomeInstructorForm;