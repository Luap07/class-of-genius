import { useEffect, useState } from "react";

import {
  getPayments,
  updatePaymentStatus,
  deletePayment
} from "../../services/admin/adminPaymentService";


const useAdminPayments = () => {

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);



  const fetchPayments = async () => {

    try {

      setLoading(true);


      const data =
        await getPayments();


      setPayments(data);


    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };



  const changePaymentStatus = async (
    id,
    status
  ) => {

    try {

      const updated =
        await updatePaymentStatus(
          id,
          status
        );


      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === id
            ? updated
            : payment
        )
      );


    } catch (err) {

      setError(err.message);

    }

  };



  const removePayment = async (
    id
  ) => {

    try {

      await deletePayment(id);


      setPayments((prev) =>
        prev.filter(
          (payment) =>
            payment.id !== id
        )
      );


    } catch (err) {

      setError(err.message);

    }

  };



  useEffect(() => {

    fetchPayments();

  }, []);



  return {

    payments,

    loading,

    error,

    fetchPayments,

    changePaymentStatus,

    removePayment

  };

};


export default useAdminPayments;