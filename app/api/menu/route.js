import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  const jsonDirectory = path.join(process.cwd());
  const fileContents = await fs.readFile(jsonDirectory + '/menu.json', 'utf8');
  const menu = JSON.parse(fileContents);
  return NextResponse.json(menu);
}
