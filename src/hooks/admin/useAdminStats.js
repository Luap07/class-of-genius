import { useEffect, useState } from "react";

import {
  getAdminStats
} from "../../services/admin/adminAnalyticsService";


const useAdminStats = () => {

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    instructors: 0,
    revenue: 0,
    enrollments: 0,
    reviews: 0
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  const fetchStats = async () => {

    try {

      setLoading(true);


      const data =
        await getAdminStats();


      setStats(data);


    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchStats();

  }, []);


  return {

    stats,

    loading,

    error,

    fetchStats

  };

};


export default useAdminStats;