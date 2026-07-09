import { useEffect, useState } from "react";

import {
  getAdminStats
} from "../../services/admin/adminAnalyticsService";


const useAdminAnalytics = () => {

  const [analytics, setAnalytics] = useState({
    users: 0,
    courses: 0,
    instructors: 0,
    enrollments: 0,
    revenue: 0,
    reviews: 0
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);



  const fetchAnalytics = async () => {

    try {

      setLoading(true);


      const data =
        await getAdminStats();


      setAnalytics(data);


    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchAnalytics();

  }, []);



  return {

    analytics,

    loading,

    error,

    fetchAnalytics

  };

};


export default useAdminAnalytics;