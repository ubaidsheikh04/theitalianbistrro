import { withLock } from './utils/lock';
import { promises as fs } from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'db.json');

export const readDb = () => withLock(dbFilePath, async () => {
    try {
        const data = await fs.readFile(dbFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('db.json not found, initializing with default data');
            const defaultData = {
                tables: Array.from({ length: 10 }, (_, i) => ({ number: i + 1, occupied: false, orderIds: [], totalBill: 0, paid: false })),
                menu: [
                    { id: 1, name: "Margherita Pizza", price: 12.99, stock: 10 },
                    { id: 2, name: "Cheeseburger", price: 8.99, stock: 15 },
                    { id: 3, name: "Caesar Salad", price: 7.49, stock: 20 },
                    { id: 4, name: "Spaghetti Carbonara", price: 14.99, stock: 12 },
                    { id: 5, name: "Fish and Chips", price: 13.99, stock: 8 }
                ],
                orders: [],
                nextOrderId: 1
            };
            await fs.writeFile(dbFilePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        console.error("Error reading from db.json:", error);
        throw error;
    }
});

export const writeDb = (data) => withLock(dbFilePath, async () => {
    try {
        await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to db.json:", error);
        throw error;
    }
});
