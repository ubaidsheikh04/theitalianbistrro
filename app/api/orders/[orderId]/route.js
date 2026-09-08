import { NextResponse } from 'next/server';
import { db } from '@/database';

export async function PUT(request, { params }) {
    const { orderId } = await params;

    try {
        const { items, status } = await request.json();

        if (status) {
            const orderRef = db.collection('orders').doc(orderId);
            const orderDoc = await orderRef.get();

            if (!orderDoc.exists) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            await orderRef.update({ status });

            return NextResponse.json({
                message: 'Order status updated successfully',
            });
        }

        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Items array is required for update.' },
                { status: 400 }
            );
        }

        await db.runTransaction(async (transaction) => {

            // ============================================================
            // GET ORDER
            // ============================================================

            const orderRef = db.collection('orders').doc(orderId);
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data();

            // ============================================================
            // CALCULATE NEW ORDER TOTAL
            // ============================================================

            const newOrderTotal = items.reduce(
                (sum, item) =>
                    sum +
                    (Number(item.price) || 0) *
                    (Number(item.quantity) || 0),
                0
            );

            // ============================================================
            // GET TABLE BEFORE ANY WRITES
            // ============================================================

            let tableRef = null;
            let tableDoc = null;
            let orderDocs = [];

            if (orderData.tableNumber) {

                tableRef = db
                    .collection('tables')
                    .doc(String(orderData.tableNumber));

                tableDoc = await transaction.get(tableRef);

                if (tableDoc.exists) {

                    const tableData = tableDoc.data();
                    const orderIds = tableData.orderIds || [];

                    if (orderIds.length > 0) {

                        const orderRefs = orderIds.map(id =>
                            db.collection('orders').doc(id)
                        );

                        orderDocs = await transaction.getAll(
                            ...orderRefs
                        );
                    }
                }
            }

            // ============================================================
            // UPDATE ORDER
            // ============================================================

            transaction.update(orderRef, {
                items: items,
                totalBill: newOrderTotal
            });

            // ============================================================
            // UPDATE TABLE TOTAL
            // ============================================================

            if (tableDoc && tableDoc.exists) {

                const tableData = tableDoc.data();
                const orderIds = tableData.orderIds || [];

                if (orderIds.length > 0) {

                    let newTableTotal = 0;

                    for (const doc of orderDocs) {

                        if (doc.id === orderId) {
                            newTableTotal += newOrderTotal;
                        } else if (doc.exists) {
                            newTableTotal +=
                                Number(doc.data().totalBill) || 0;
                        }
                    }

                    transaction.update(tableRef, {
                        totalBill: newTableTotal
                    });

                } else {

                    transaction.update(tableRef, {
                        totalBill: newOrderTotal,
                        occupied: true
                    });
                }
            }
        });

        return NextResponse.json({
            message: 'Order updated successfully'
        });

    } catch (error) {

        console.error('Order update failed:', error);

        return NextResponse.json(
            {
                error: error.message || 'Failed to update order'
            },
            { status: 500 }
        );
    }
}


// ============================================================
// DELETE ORDER
// ============================================================

export async function DELETE(request, { params }) {

    const { orderId } = await params;

    try {

        await db.runTransaction(async (transaction) => {

            const orderRef =
                db.collection('orders').doc(orderId);

            const orderDoc =
                await transaction.get(orderRef);

            if (!orderDoc.exists) {
                return;
            }

            const orderData = orderDoc.data();

            let tableRef = null;
            let tableDoc = null;
            let newOrderIds = [];
            let orderDocs = [];

            // ========================================================
            // READ TABLE BEFORE ANY WRITES
            // ========================================================

            if (orderData.tableNumber) {

                tableRef = db
                    .collection('tables')
                    .doc(String(orderData.tableNumber));

                tableDoc =
                    await transaction.get(tableRef);

                if (tableDoc.exists) {

                    const tableData =
                        tableDoc.data();

                    const orderIds =
                        tableData.orderIds || [];

                    newOrderIds =
                        orderIds.filter(
                            id => id !== orderId
                        );

                    if (newOrderIds.length > 0) {

                        const orderRefs =
                            newOrderIds.map(id =>
                                db
                                    .collection('orders')
                                    .doc(id)
                            );

                        orderDocs =
                            await transaction.getAll(
                                ...orderRefs
                            );
                    }
                }
            }

            // ========================================================
            // DELETE ORDER
            // ========================================================

            transaction.delete(orderRef);

            // ========================================================
            // UPDATE TABLE
            // ========================================================

            if (tableDoc && tableDoc.exists) {

                if (newOrderIds.length === 0) {

                    transaction.update(tableRef, {
                        orderIds: [],
                        totalBill: 0,
                        occupied: false
                    });

                } else {

                    const newTableTotal =
                        orderDocs.reduce(
                            (sum, doc) => {

                                if (doc.exists) {
                                    return (
                                        sum +
                                        (Number(
                                            doc.data().totalBill
                                        ) || 0)
                                    );
                                }

                                return sum;
                            },
                            0
                        );

                    transaction.update(tableRef, {
                        orderIds: newOrderIds,
                        totalBill: newTableTotal
                    });
                }
            }
        });

        return NextResponse.json({
            message: 'Order deleted successfully'
        });

    } catch (error) {

        console.error(
            'Order deletion failed:',
            error
        );

        return NextResponse.json(
            {
                error:
                    error.message ||
                    'Failed to delete order'
            },
            { status: 500 }
        );
    }
}