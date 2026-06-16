import sci_fic from "./sci_fic";
import romance from "./romance";
import fantasy from "./fantasy";
import thriller from "./thriller";
import mystery from "./mystery";
import adventure from "./adventure";
import historical from "./historical";
import christian from "./christian";
import comedy from "./comedy";
import educational from "./educational";
import african from "./african-literature";



/* ================= ALL STORIES ================= */
export const STORIES = [
  sci_fic,
  romance,
  fantasy,
  thriller,
  mystery,
  adventure,
  historical,
  christian,
  comedy,
  educational,
  african,
];

/* ================= OPTIONAL HELPERS ================= */

// get story by id
export const getStoryById = (id) =>
  STORIES.find((story) => story.id === id);

// get stories by genre
export const getStoriesByGenre = (genre) =>
  STORIES.filter((story) => story.genre === genre);

// get all genres (for UI)
export const getGenres = () =>
  [...new Set(STORIES.map((s) => s.genre))];