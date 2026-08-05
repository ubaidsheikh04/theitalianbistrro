import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { withLock } from '@/utils/lock';

const tablesFilePath = path.join(process.cwd(), 'tables.json');

async function readTables() {
    try {
        const fileContents = await fs.readFile(tablesFilePath, 'utf8');
        if (!fileContents) {
            return [];
        }
        return JSON.parse(fileContents);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function writeTables(tables) {
    await fs.writeFile(tablesFilePath, JSON.stringify(tables, null, 2));
}

export async function POST(request) {
    return await withLock(tablesFilePath, async () => {
        const { tableId } = await request.json();
        let tables = await readTables();
        
        const tableIndex = tables.findIndex(t => t.id === tableId);
        if (tableIndex === -1) {
            return new NextResponse(JSON.stringify({ message: 'Table not found' }), { status: 404 });
        }

        tables[tableIndex] = { ...tables[tableIndex], occupied: false, orderIds: [], totalBill: 0 };
        
        await writeTables(tables);
        
        return NextResponse.json({ message: 'Table marked as paid successfully' });
    });
}
