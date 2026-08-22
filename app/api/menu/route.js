import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd());

export async function GET() {
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'menu.json'), 'utf8');
    const menu = JSON.parse(fileContents);
    return NextResponse.json(menu);
}
