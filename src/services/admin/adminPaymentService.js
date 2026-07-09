import { supabase } from "../../supabaseClient";


// Get all payments
export const getPayments = async () => {

  const {
    data,
    error
  } = await supabase
    .from("payments")
    .select(`
      *,
      user:users(
        id,
        name,
        email
      )
    `)
    .order("created_at", {
      ascending: false
    });


  if (error) throw error;


  return data;

};



// Get single payment
export const getPaymentById = async (
  id
) => {

  const {
    data,
    error
  } = await supabase
    .from("payments")
    .select(`
      *,
      user:users(
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .single();


  if (error) throw error;


  return data;

};



// Update payment status
export const updatePaymentStatus = async (
  id,
  status
) => {

  const {
    data,
    error
  } = await supabase
    .from("payments")
    .update({
      status
    })
    .eq("id", id)
    .select()
    .single();


  if (error) throw error;


  return data;

};



// Delete payment
export const deletePayment = async (
  id
) => {

  const {
    error
  } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);


  if (error) throw error;


  return true;

};