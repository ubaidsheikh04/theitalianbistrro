import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = "force-dynamic";

export async function GET() {
    const menuCollection = db.collection('menu');
    const snapshot = await menuCollection.get();
    if (snapshot.empty) {
        return NextResponse.json([]);
    }
    const menu = [];
    snapshot.forEach(doc => {
        menu.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(menu);
}
