import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { withLock } from '@/utils/lock';

const tablesFilePath = path.join(process.cwd(), 'tables.json');

async function readTables() {
    const fileContents = await fs.readFile(tablesFilePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function GET() {
  return await withLock(tablesFilePath, async () => {
    const tables = await readTables();
    return NextResponse.json(tables);
  });
}
