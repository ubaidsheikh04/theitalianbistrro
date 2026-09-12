
import { NextResponse } from 'next/server';
import { db } from '@/database';

// Force dynamic rendering and prevent caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await db.collection('menu').get();
    const menu = [];
    snapshot.forEach((doc) => {
      menu.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    return NextResponse.json(menu);
  } catch (error) {
    console.error('GET /api/menu error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, category, image } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const newItem = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      category: category.trim(),
      image: image || '',
      isAvailable: true, // New items are available by default
    };

    const docRef = await db.collection('menu').add(newItem);

    return NextResponse.json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error('POST /api/menu error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body; // Use object spreading to capture all update fields

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json({ error: 'Valid menu item ID is required' }, { status: 400 });
    }

    const menuItemId = id.trim();

    // Sanitize any string inputs if they exist
    if (typeof updateData.name === 'string') updateData.name = updateData.name.trim();
    if (typeof updateData.category === 'string') updateData.category = updateData.category.trim();
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);

    // Ensure all required fields for an update are present if they are being changed
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No update data provided" }, { status: 400 });
    }

    await db.collection('menu').doc(menuItemId).update(updateData);

    return NextResponse.json({ id: menuItemId, ...updateData });
  } catch (error) {
    console.error('PUT /api/menu error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json({ error: 'Valid menu item ID is required' }, { status: 400 });
    }

    const menuItemId = id.trim();
    await db.collection('menu').doc(menuItemId).delete();

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete menu item' }, { status: 500 });
  }
}
