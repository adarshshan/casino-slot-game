import React, { useEffect, useState } from "react";
import UserList from "../components/UserList";
import BalanceRequestList from "../components/BalanceRequestList";
import useApiRequest from "../hooks/useApiRequest";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [balanceRequests, setBalanceRequests] = useState([]);
  const [fetchAgain, setFetchAgain] = useState<{
    getUsers: number;
    getBalance: number;
  }>({ getUsers: 0, getBalance: 0 });
  const { request: userRequest, loading: userLoading } = useApiRequest();
  const { request: getBalanceRequest, loading: balanceLoading } =
    useApiRequest();

  useEffect(() => {
    getAllUsers(); // Fetch users
  }, [fetchAgain.getUsers]);

  useEffect(() => {
    getBalanceRequests(); // Fetch balance requests
  }, [fetchAgain.getBalance]);

  const getAllUsers = async () => {
    try {
      const data = await userRequest({
        url: `${import.meta.env.VITE_BASEURL}/api/admin/users`,
        method: "GET",
      });
      if (data && data?.users && data?.users?.length) {
        setUsers(data?.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
      console.log(error as Error);
    }
  };

  const getBalanceRequests = async () => {
    try {
      getBalanceRequest;
      const data = await getBalanceRequest({
        url: `${import.meta.env.VITE_BASEURL}/api/admin/balance-requests`,
        method: "GET",
      });
      if (data && data?.requests && data?.requests?.length) {
        setBalanceRequests(data?.requests);
      } else {
        setBalanceRequests([]);
      }
    } catch (error) {
      setBalanceRequests([]);
      console.log(error as Error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          {userLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <UserList users={users} setFetchAgain={setFetchAgain} />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Balance Requests</h2>
          {balanceLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BalanceRequestList
              requests={balanceRequests}
              setFetchAgain={setFetchAgain}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
