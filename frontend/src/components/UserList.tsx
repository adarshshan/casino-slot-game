import React from "react";
import useApiRequest from "../hooks/useApiRequest";

interface UserListInterface {
  users: any[];
  setFetchAgain: React.Dispatch<
    React.SetStateAction<{
      getUsers: number;
      getBalance: number;
    }>
  >;
}

const UserList: React.FC<UserListInterface> = ({ users, setFetchAgain }) => {
  const { request: deleteRequest, loading: deleteLoading } = useApiRequest();

  const handleDelete = async (id: string) => {
    try {
      const data = await deleteRequest({
        url: `${import.meta.env.VITE_BASEURL}/api/admin/users/${id}`,
        method: "DELETE",
      });
      if (data && data.success) {
        setFetchAgain((prev) => {
          return {
            ...prev,
            getUsers: prev.getUsers + 1,
          };
        });
      }
    } catch (error) {
      console.log(error as Error);
    }
  };

  const handleIncreaseBalance = (id: string) => {
    const token = localStorage.getItem("adminToken");
    const amount = prompt("Enter amount to increase:");
    if (amount) {
      fetch(`/api/admin/users/${id}/increase-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseInt(amount) }),
      }).then(() => {
        window.location.reload();
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <ul>
        {users &&
          users?.length > 0 &&
          users?.map((user) => (
            <li
              key={user?._id}
              className="flex justify-between items-center mb-2 p-2 border-b"
            >
              <div>
                <p className="font-bold">{user?.username}</p>
                <p>Balance: {user?.balance}</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user?._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => handleIncreaseBalance(user?._id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Increase Balance
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
