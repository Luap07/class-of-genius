import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import Dashboard from "../../pages/lms/Dashboard";
import Courses from "../../pages/lms/Courses";
import Course from "../../pages/lms/Course";
import Lesson from "../../pages/lms/Lesson";
import Assignments from "../../pages/lms/Assignments";
import Resources from "../../pages/lms/Resources";
import Progress from "../../pages/lms/Progress";
import Certificates from "../../pages/lms/Certificates";
import Profile from "../../pages/lms/Profile";

const pageAnimation = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const MainContent = ({ activePage }) => {
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "courses":
        return <Courses />;

      case "course":
        return <Course />;

      case "lesson":
        return <Lesson />;

      case "assignments":
        return <Assignments />;

      case "resources":
        return <Resources />;

      case "progress":
        return <Progress />;

      case "certificates":
        return <Certificates />;

      case "profile":
        return <Profile />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          variants={pageAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainContent;