import { useEffect, useState } from "react";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../../services/admin/adminUserService";


const useAdminUsers = () => {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  const fetchUsers = async () => {

    try {

      setLoading(true);

      const data = await getUsers();

      setUsers(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };


  const addUser = async (userData) => {

    try {

      const newUser = await createUser(userData);

      setUsers((prev) => [
        ...prev,
        newUser
      ]);

    } catch (err) {

      setError(err.message);

    }

  };


  const editUser = async (
    id,
    userData
  ) => {

    try {

      const updatedUser =
        await updateUser(
          id,
          userData
        );


      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? updatedUser
            : user
        )
      );


    } catch (err) {

      setError(err.message);

    }

  };


  const removeUser = async (id) => {

    try {

      await deleteUser(id);


      setUsers((prev) =>
        prev.filter(
          (user) =>
            user.id !== id
        )
      );


    } catch (err) {

      setError(err.message);

    }

  };


  useEffect(() => {

    fetchUsers();

  }, []);


  return {

    users,

    loading,

    error,

    fetchUsers,

    addUser,

    editUser,

    removeUser

  };

};


export default useAdminUsers;