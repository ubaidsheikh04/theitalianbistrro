import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const menuFilePath = path.join(process.cwd(), 'menu.json');

async function readMenu() {
  try {
    const fileContents = await fs.readFile(menuFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error.code === 'ENOENT') return []; // Return empty array if file doesn't exist
    throw error;
  }
}

async function writeMenu(menu) {
  await fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2));
}

export async function GET() {
  const menu = await readMenu();
  return NextResponse.json(menu);
}

export async function POST(request) {
  try {
    const { name, price } = await request.json();
    const menu = await readMenu();

    // Basic validation
    if (!name || price == null) {
      return new NextResponse(JSON.stringify({ message: 'Name and price are required' }), { status: 400 });
    }

    const newMenuItem = {
      id: menu.length > 0 ? Math.max(...menu.map(item => item.id)) + 1 : 1,
      name,
      price: parseFloat(price),
    };

    menu.push(newMenuItem);
    await writeMenu(menu);

    return new NextResponse(JSON.stringify({ message: 'Menu item added successfully', item: newMenuItem }), { status: 201 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Error adding menu item', error: error.message }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    let menu = await readMenu();
    const updatedMenu = menu.filter(item => item.id !== id);

    if (menu.length === updatedMenu.length) {
      return new NextResponse(JSON.stringify({ message: 'Menu item not found' }), { status: 404 });
    }

    await writeMenu(updatedMenu);
    return new NextResponse(JSON.stringify({ message: 'Menu item deleted successfully' }), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Error deleting menu item', error: error.message }), { status: 500 });
  }
}
