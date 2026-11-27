import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ expenseDate: -1 });
    return NextResponse.json({ success: true, data: expenses }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.vendor || !body.amount || !body.expenseDate) {
      return NextResponse.json(
        { success: false, error: "Vendor, Amount, and Date are required" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    const amountINR = body.amountINR ? Number(body.amountINR) : (body.currency === "USD" ? amount * 87 : amount);

    const expense = await Expense.create({
      expenseDate: body.expenseDate,
      vendor: body.vendor,
      category: body.category || "Software/SaaS",
      description: body.description || "",
      amount,
      currency: body.currency || "USD",
      amountINR,
      paymentMethod: body.paymentMethod || "Credit Card",
      receiptReference: body.receiptReference || "",
    });

    await AuditLog.create({
      action: "EXPENSE_ADDED",
      entityType: "Expense",
      entityId: expense._id.toString(),
      summary: `Added business expense for ${expense.vendor} (${expense.currency} ${expense.amount} / ₹${amountINR.toLocaleString()})`,
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Expense ID is required" }, { status: 400 });
    }

    const expense = await Expense.findByIdAndDelete(id);

    if (expense) {
      await AuditLog.create({
        action: "EXPENSE_DELETED",
        entityType: "Expense",
        entityId: id,
        summary: `Deleted business expense: ${expense.vendor} (${expense.currency} ${expense.amount})`,
      });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
