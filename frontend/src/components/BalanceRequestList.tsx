import React from "react";
import useApiRequest from "../hooks/useApiRequest";

interface BalanceRequestListInterface {
  requests: any[];
  setFetchAgain: React.Dispatch<
    React.SetStateAction<{
      getUsers: number;
      getBalance: number;
    }>
  >;
}
const BalanceRequestList: React.FC<BalanceRequestListInterface> = ({
  requests,
  setFetchAgain,
}) => {
  const { request: approveRequest, loading: approveLoading } = useApiRequest();

  const handleApprove = async (id: string) => {
    try {
      const data = await approveRequest({
        url: `${
          import.meta.env.VITE_BASEURL
        }/api/admin/balance-requests/${id}/approve`,
        method: "POST",
      });

      if (data && data?.success) {
        setFetchAgain((prev) => {
          return {
            ...prev,
            getBalance: prev.getBalance + 1,
          };
        });
      }
    } catch (error) {
      console.log(error as Error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <ul>
        {requests &&
          requests?.length > 0 &&
          requests?.map((request) => (
            <li
              key={request?._id}
              className="flex justify-between items-center mb-2 p-2 border-b"
            >
              <div>
                <p className="font-bold">{request.user.username}</p>
                <p>Status: {request?.status}</p>
              </div>
              {request.status === "pending" && (
                <button
                  onClick={() => handleApprove(request._id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  disabled={approveLoading}
                >
                  {approveLoading ? "Approving..." : "Approve"}
                </button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default BalanceRequestList;
