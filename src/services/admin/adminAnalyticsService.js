import { supabase } from "../../supabaseClient";


// Get dashboard statistics
export const getAdminStats = async () => {

  const [
    users,
    courses,
    instructors,
    enrollments,
    payments,
    reviews
  ] = await Promise.all([

    supabase
      .from("users")
      .select("id", {
        count: "exact"
      }),


    supabase
      .from("courses")
      .select("id", {
        count: "exact"
      }),


    supabase
      .from("users")
      .select("id", {
        count: "exact"
      })
      .eq("role", "instructor"),


    supabase
      .from("enrollments")
      .select("id", {
        count: "exact"
      }),


    supabase
      .from("payments")
      .select("amount"),


    supabase
      .from("reviews")
      .select("id", {
        count: "exact"
      })

  ]);



  const revenue =
    payments.data?.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    ) || 0;



  return {

    users:
      users.count || 0,


    courses:
      courses.count || 0,


    instructors:
      instructors.count || 0,


    enrollments:
      enrollments.count || 0,


    revenue,


    reviews:
      reviews.count || 0

  };

};