// import express from "express";

// import {
//   importUniversityPage,
// } from "../services/universityImporter.js";

// import {
//   importUniversityAcademics,
// } from "../services/universityAcademicImporter.js";

// const router = express.Router();

// /* =========================================================
//    IMPORT ONE PAGE + ACADEMIC DATA
//    POST /api/universities/import/page
// ========================================================= */

// router.post(
//   "/page",
//   async (req, res) => {
//     try {
//       const cursor =
//         req.body?.cursor || "*";

//       const perPage = Math.min(
//         Math.max(
//           Number(
//             req.body?.perPage || 10
//           ),
//           1
//         ),
//         100
//       );

//       console.log(
//         "=============================================="
//       );

//       console.log(
//         "🌍 UNIVERSITY DISCOVERY STARTED"
//       );

//       console.log(
//         `📦 Per page: ${perPage}`
//       );

//       console.log(
//         "=============================================="
//       );

//       /* -----------------------------------------------------
//          1. DISCOVER UNIVERSITIES
//       ----------------------------------------------------- */

//       const discovery =
//         await importUniversityPage({
//           cursor,
//           perPage,
//         });

//       console.log(
//         "✅ University discovery completed:"
//       );

//       console.log(
//         discovery.statistics
//       );

//       /* -----------------------------------------------------
//          2. COLLECT CREATED + EXISTING
//       ----------------------------------------------------- */

//       const universities = [
//         ...(discovery.created || []),
//         ...(discovery.existing || []),
//       ];

//       const academicResults = [];

//       const academicStatistics = {
//         started: 0,
//         completed: 0,
//         failed: 0,

//         facultiesCreated: 0,
//         facultiesUpdated: 0,

//         coursesCreated: 0,
//         coursesUpdated: 0,
//       };

//       const academicErrors = [];

//       /* -----------------------------------------------------
//          3. IMPORT FACULTIES + COURSES
//       ----------------------------------------------------- */

//       for (
//         const university
//         of universities
//       ) {
//         if (!university?.id) {
//           academicErrors.push({
//             university:
//               university?.name ||
//               "Unknown university",

//             error:
//               "University ID is missing.",
//           });

//           continue;
//         }

//         academicStatistics.started++;

//         console.log(
//           `🎓 Importing academics: ${university.name}`
//         );

//         try {
//           const academicResult =
//             await importUniversityAcademics(
//               university.id
//             );

//           academicStatistics.completed++;

//           const stats =
//             academicResult?.statistics ||
//             {};

//           academicStatistics.facultiesCreated +=
//             Number(
//               stats.facultiesCreated || 0
//             );

//           academicStatistics.facultiesUpdated +=
//             Number(
//               stats.facultiesUpdated || 0
//             );

//           academicStatistics.coursesCreated +=
//             Number(
//               stats.coursesCreated || 0
//             );

//           academicStatistics.coursesUpdated +=
//             Number(
//               stats.coursesUpdated || 0
//             );

//           academicResults.push({
//             university: {
//               id:
//                 university.id,

//               name:
//                 university.name,
//             },

//             academicImport:
//               academicResult,
//           });

//           console.log(
//             `✅ Academic import completed: ${university.name}`
//           );
//         } catch (error) {
//           academicStatistics.failed++;

//           console.error(
//             `❌ Academic import failed: ${university.name}`,
//             error
//           );

//           academicErrors.push({
//             university:
//               university.name,

//             universityId:
//               university.id,

//             error:
//               error?.message ||
//               String(error),
//           });
//         }
//       }

//       /* -----------------------------------------------------
//          4. FINAL RESPONSE
//       ----------------------------------------------------- */

//       console.log(
//         "=============================================="
//       );

//       console.log(
//         "🎓 UNIVERSITY + ACADEMIC IMPORT COMPLETE"
//       );

//       console.log(
//         "=============================================="
//       );

//       return res.status(200).json({
//         success: true,

//         message:
//           "Universities and academic programmes imported successfully.",

//         discovery: {
//           statistics:
//             discovery.statistics,

//           created:
//             discovery.created,

//           existing:
//             discovery.existing,

//           skipped:
//             discovery.skipped,

//           errors:
//             discovery.errors,
//         },

//         academics: {
//           statistics:
//             academicStatistics,

//           universities:
//             academicResults,

//           errors:
//             academicErrors,
//         },

//         nextCursor:
//           discovery.nextCursor ||
//           null,
//       });
//     } catch (error) {
//       console.error(
//         "❌ University page import error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,

//         error:
//           "Failed to import university page.",

//         details:
//           process.env.NODE_ENV ===
//           "development"
//             ? error?.message
//             : undefined,
//       });
//     }
//   }
// );

// /* =========================================================
//    IMPORT MULTIPLE PAGES + ACADEMICS
//    POST /api/universities/import
// ========================================================= */

// router.post(
//   "/",
//   async (req, res) => {
//     try {
//       const pages = Math.min(
//         Math.max(
//           Number(
//             req.body?.pages || 1
//           ),
//           1
//         ),
//         100
//       );

//       const perPage = Math.min(
//         Math.max(
//           Number(
//             req.body?.perPage || 10
//           ),
//           1
//         ),
//         100
//       );

//       let cursor = "*";

//       const statistics = {
//         pagesRequested:
//           pages,

//         pagesProcessed:
//           0,

//         universitiesFetched:
//           0,

//         universitiesCreated:
//           0,

//         universitiesExisting:
//           0,

//         universitiesSkipped:
//           0,

//         universitiesFailed:
//           0,

//         academicImportsStarted:
//           0,

//         academicImportsCompleted:
//           0,

//         academicImportsFailed:
//           0,

//         facultiesCreated:
//           0,

//         facultiesUpdated:
//           0,

//         coursesCreated:
//           0,

//         coursesUpdated:
//           0,
//       };

//       const universities = [];

//       const errors = [];

//       console.log(
//         "=============================================="
//       );

//       console.log(
//         "🌍 UNIVERSITY IMPORT STARTED"
//       );

//       console.log(
//         `📄 Pages: ${pages}`
//       );

//       console.log(
//         `📦 Per page: ${perPage}`
//       );

//       console.log(
//         "=============================================="
//       );

//       /* -----------------------------------------------------
//          PAGE LOOP
//       ----------------------------------------------------- */

//       for (
//         let page = 0;
//         page < pages;
//         page++
//       ) {
//         console.log(
//           `🌍 Importing page ${
//             page + 1
//           }/${pages}...`
//         );

//         /* ---------------------------------------------------
//            DISCOVER UNIVERSITIES
//         --------------------------------------------------- */

//         const discovery =
//           await importUniversityPage({
//             cursor,
//             perPage,
//           });

//         statistics.pagesProcessed++;

//         statistics.universitiesFetched +=
//           Number(
//             discovery.statistics
//               ?.fetched || 0
//           );

//         statistics.universitiesCreated +=
//           Number(
//             discovery.statistics
//               ?.created || 0
//           );

//         statistics.universitiesExisting +=
//           Number(
//             discovery.statistics
//               ?.existing || 0
//           );

//         statistics.universitiesSkipped +=
//           Number(
//             discovery.statistics
//               ?.skipped || 0
//           );

//         statistics.universitiesFailed +=
//           Number(
//             discovery.statistics
//               ?.failed || 0
//           );

//         if (
//           Array.isArray(
//             discovery.statistics
//               ?.errors
//           )
//         ) {
//           errors.push(
//             ...discovery.statistics.errors
//           );
//         }

//         /* ---------------------------------------------------
//            CREATED + EXISTING UNIVERSITIES
//         --------------------------------------------------- */

//         const discoveredUniversities = [
//           ...(discovery.created || []),
//           ...(discovery.existing || []),
//         ];

//         /* ---------------------------------------------------
//            ACADEMIC IMPORT
//         --------------------------------------------------- */

//         for (
//           const university
//           of discoveredUniversities
//         ) {
//           if (!university?.id) {
//             errors.push({
//               university:
//                 university?.name ||
//                 "Unknown university",

//               stage:
//                 "academic_import",

//               error:
//                 "University ID is missing.",
//             });

//             continue;
//           }

//           statistics.academicImportsStarted++;

//           console.log(
//             `🎓 Importing faculties and courses for: ${university.name}`
//           );

//           try {
//             const academicResult =
//               await importUniversityAcademics(
//                 university.id
//               );

//             statistics.academicImportsCompleted++;

//             const academicStats =
//               academicResult
//                 ?.statistics || {};

//             statistics.facultiesCreated +=
//               Number(
//                 academicStats
//                   .facultiesCreated || 0
//               );

//             statistics.facultiesUpdated +=
//               Number(
//                 academicStats
//                   .facultiesUpdated || 0
//               );

//             statistics.coursesCreated +=
//               Number(
//                 academicStats
//                   .coursesCreated || 0
//               );

//             statistics.coursesUpdated +=
//               Number(
//                 academicStats
//                   .coursesUpdated || 0
//               );

//             universities.push({
//               id:
//                 university.id,

//               name:
//                 university.name,

//               short_name:
//                 university.short_name,

//               website:
//                 university.website,

//               academicImport:
//                 academicResult,
//             });

//             console.log(
//               `✅ Academic import completed: ${university.name}`
//             );
//           } catch (error) {
//             statistics.academicImportsFailed++;

//             console.error(
//               `❌ Academic import failed for ${university.name}:`,
//               error
//             );

//             errors.push({
//               university:
//                 university.name,

//               universityId:
//                 university.id,

//               stage:
//                 "academic_import",

//               error:
//                 error?.message ||
//                 String(error),
//             });
//           }
//         }

//         /* ---------------------------------------------------
//            NEXT OPENALEX PAGE
//         --------------------------------------------------- */

//         cursor =
//           discovery.nextCursor;

//         if (!cursor) {
//           console.log(
//             "🌍 No more OpenAlex pages available."
//           );

//           break;
//         }
//       }

//       /* -----------------------------------------------------
//          COMPLETE
//       ----------------------------------------------------- */

//       console.log(
//         "=============================================="
//       );

//       console.log(
//         "🎓 UNIVERSITY + ACADEMIC IMPORT COMPLETE"
//       );

//       console.log(
//         statistics
//       );

//       console.log(
//         "=============================================="
//       );

//       return res.status(200).json({
//         success: true,

//         message:
//           "Universities, faculties and courses imported successfully.",

//         statistics,

//         universities,

//         errors,

//         nextCursor:
//           cursor || null,
//       });
//     } catch (error) {
//       console.error(
//         "❌ University import error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,

//         error:
//           "Failed to import universities.",

//         details:
//           process.env.NODE_ENV ===
//           "development"
//             ? error?.message
//             : undefined,
//       });
//     }
//   }
// );

// /* =========================================================
//    EXPORT
// ========================================================= */

// export default router;