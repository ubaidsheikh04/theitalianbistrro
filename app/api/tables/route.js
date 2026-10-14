import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = "force-dynamic";

export async function GET() {
    const tablesCollection = db.collection('tables');
    const snapshot = await tablesCollection.get();
    console.log('[Tables API] Documents returned:', snapshot.size);
    if (snapshot.empty) {
        return NextResponse.json([]);
    }
    const tables = [];
    snapshot.forEach(doc => {
        tables.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(tables);
}
