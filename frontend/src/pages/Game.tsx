import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import SpinningReel from "./SpinningReel";

const reelEmojis: { [key: string]: string } = {
  CHERRY: "🍒",
  LEMON: "🍋",
  ORANGE: "🍊",
  PLUM: "🍑",
  BELL: "🔔",
  BAR: "🍫",
  SEVEN: "7️⃣",
};

interface SpinErrorData {
  message: string;
  code?: string; // Optional error code
  details?: string; // Optional additional details
}

const Game: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [balance, setBalance] = useState(0);
  const [reels, setReels] = useState<string[]>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinError, setSpinError] = useState<SpinErrorData | null>(null); // Updated state for spin errors
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken"); // Corrected to accessToken

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASEURL, {
      auth: {
        token,
      },
    });
    console.log(
      "Attempting to connect socket to:",
      import.meta.env.VITE_BASEURL
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("balance");
    });

    newSocket.on("balance_result", (data) => {
      setBalance(data.balance);
    });

    newSocket.on("spin_result", (data) => {
      // Ensure the spinning animation is visible for at least 1 second
      setTimeout(() => {
        setReels(data.reels);
        setWinAmount(data.winAmount);
        setBalance(data.balance);
        setIsSpinning(false);
      }, 1000);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      // Handle specific errors, e.g., invalid token
      if (error === "Authentication error") {
        navigate("/login");
      }
    });

    newSocket.on("spin_error", (data: SpinErrorData) => {
      console.error("Spin error from server:", data);
      setSpinError(data);
      setIsSpinning(false); // Stop spinning animation on error
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, navigate]);

  const handleSpin = () => {
    if (socket && !isSpinning) {
      setIsSpinning(true);
      setWinAmount(0); // Reset win amount on new spin
      setSpinError(null); // Clear any previous spin errors
      socket.emit("spin", 10); // Hardcoded wager for now
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 text-yellow-400">Slot Game</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Balance:</h2>
          <span className="text-3xl font-bold text-green-400">
            ${balance.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-center items-center space-x-4 mb-8">
          {reels.length > 0
            ? reels.map((reel, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-4xl font-bold"
                >
                  {isSpinning ? <SpinningReel /> : reelEmojis[reel] || reel}{" "}
                </div>
              ))
            : // Placeholder for initial state or before first spin
              Array(3)
                .fill("-")
                .map((_, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-4xl font-bold text-gray-500"
                  >
                    ?
                  </div>
                ))}
        </div>

        {winAmount > 0 && (
          <div className="text-center text-4xl font-bold text-yellow-300 mb-6 animate-bounce">
            WIN: ${winAmount.toFixed(2)}
          </div>
        )}

        {spinError && (
          <div className="text-center text-red-500 text-lg font-semibold mb-4">
            Error: {spinError.message}
            {spinError.code && <span className="ml-2 text-red-400">({spinError.code})</span>}
            {spinError.details && <p className="text-sm text-red-400 mt-1">Details: {spinError.details}</p>}
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={isSpinning || !socket}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 rounded-lg text-2xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "Spinning..." : "SPIN"}
        </button>
      </div>

      {/* Basic Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        }}
        className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition duration-300 ease-in-out"
      >
        Logout
      </button>
    </div>
  );
};

export default Game;
