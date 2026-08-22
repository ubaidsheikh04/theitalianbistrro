import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd());

async function readTables() {
    try {
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'tables.json'), 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

export async function GET() {
    const tables = await readTables();
    return NextResponse.json(tables);
}
