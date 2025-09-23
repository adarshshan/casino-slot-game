import { Socket } from 'socket.io';
import User from '../models/user.model';
import Transaction from '../models/transaction.model';


const SYMBOLS = [
    { symbol: 'CHERRY', weight: 10, payout: 2 },
    { symbol: 'LEMON', weight: 20, payout: 1.5 },
    { symbol: 'ORANGE', weight: 20, payout: 1.5 },
    { symbol: 'PLUM', weight: 20, payout: 1.5 },
    { symbol: 'BELL', weight: 15, payout: 5 },
    { symbol: 'BAR', weight: 10, payout: 10 },
    { symbol: 'SEVEN', weight: 5, payout: 50 },
];

const REELS_COUNT = 3;

const spinReels = () => {
    const weightedSymbols = SYMBOLS.flatMap(s => Array(s.weight).fill(s));
    const reels = [];
    for (let i = 0; i < REELS_COUNT; i++) {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        reels.push(weightedSymbols[randomIndex].symbol);
    }
    return reels;
};

const calculateWin = (reels: string[], wager: number) => {
    const allSame = reels.every(symbol => symbol === reels[0]);
    if (allSame) {
        const symbol = SYMBOLS.find(s => s.symbol === reels[0]);
        return symbol ? symbol.payout * wager : 0;
    }
    return 0;
};


export const handleSpin = (socket: Socket, redisClient: any) => {
    socket.on('spin', async (wager: number) => {
        const userId = (socket as any).userId;

        // Rate Limiting
        const key = `spin_limit:${userId}`;
        const limit = parseInt(process.env.RATE_LIMIT_SPINS!);
        const window = parseInt(process.env.RATE_LIMIT_WINDOW!);

        const current = await redisClient.get(key);
        if (current && parseInt(current) >= limit) {
            return socket.emit('spin_error', { message: 'Rate limit exceeded' });
        }

        await redisClient.multi().incr(key).expire(key, window).exec();

        try {
            const user = await User.findById(userId);
            if (!user) {
                return socket.emit('spin_error', { message: 'User not found' });
            }

            if (user.balance < wager) {
                return socket.emit('spin_error', { message: 'Insufficient balance' });
            }

            const reels = spinReels();
            const winAmount = calculateWin(reels, wager);

            user.balance += winAmount - wager;
            user.totalSpins++;
            user.totalWagered += wager;
            user.totalWon += winAmount;
            await user.save();

            const transaction = new Transaction({
                userId,
                spinResult: reels,
                winAmount,
            });
            await transaction.save();

            socket.emit('spin_result', {
                reels,
                winAmount,
                balance: user.balance,
            });

            // Invalidate leaderboard cache
            await redisClient.del('leaderboard');

        } catch (error) {
            socket.emit('spin_error', { message: 'An error occurred during the spin' });
        }
    });
};

export const handleBalance = (socket: Socket) => {
    socket.on('balance', async () => {
        const userId = (socket as any).userId;
        try {
            const user = await User.findById(userId);
            if (!user) {
                return socket.emit('balance_error', { message: 'User not found' });
            }
            socket.emit('balance_result', { balance: user.balance });
        } catch (error) {
            socket.emit('balance_error', { message: 'An error occurred while fetching balance' });
        }
    });
};

export const handleTransactions = (socket: Socket) => {
    socket.on('transactions', async ({ page = 1, limit = 10 }) => {
        const userId = (socket as any).userId;
        try {
            const transactions = await Transaction.find({ userId })
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Transaction.countDocuments({ userId });

            socket.emit('transactions_result', {
                transactions,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (error) {
            socket.emit('transactions_error', { message: 'An error occurred while fetching transactions' });
        }
    });
};
