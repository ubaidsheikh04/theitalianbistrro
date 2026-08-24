
import { NextResponse } from 'next/server';
import { db } from '@/database';

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

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('POST /api/menu received:', body);

    const {
      name,
      price,
      category,
      image,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        {
          error: 'Name and category are required',
        },
        {
          status: 400,
        }
      );
    }

    const menuCollection = db.collection('menu');

    const docRef = await menuCollection.add({
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: image || '',
    });

    console.log(
      'Menu item saved:',
      docRef.id
    );

    return NextResponse.json({
      id: docRef.id,
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: image || '',
    });

  } catch (error) {
    console.error('POST /api/menu error:', error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    console.log('PUT /api/menu received:', body);

    const {
      id,
      name,
      price,
      category,
      image,
    } = body;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid menu item ID received:', id);

      return NextResponse.json(
        {
          error: 'Valid menu item ID is required',
        },
        {
          status: 400,
        }
      );
    }

    if (!name || !category) {
      return NextResponse.json(
        {
          error: 'Name and category are required',
        },
        {
          status: 400,
        }
      );
    }

    const menuItemId = id.trim();

    const updateData = {
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image: image || '',
    };

    console.log('Updating Firestore document:', menuItemId);
    console.log('Update data:', updateData);

    await db
      .collection('menu')
      .doc(menuItemId)
      .update(updateData);

    console.log('Menu item updated successfully:', menuItemId);

    return NextResponse.json({
      id: menuItemId,
      ...updateData,
    });

  } catch (error) {
    console.error('PUT /api/menu error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to update menu item',
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid menu item ID received for deletion:', id);
      return NextResponse.json(
        { error: 'Valid menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItemId = id.trim();

    console.log('Deleting Firestore document:', menuItemId);

    await db.collection('menu').doc(menuItemId).delete();

    console.log('Menu item deleted successfully:', menuItemId);

    return NextResponse.json({ message: 'Menu item deleted successfully' });

  } catch (error) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
