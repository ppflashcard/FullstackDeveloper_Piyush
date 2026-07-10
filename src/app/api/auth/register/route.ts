import { NextResponse } from "next/server";
import { createUser, type UserPlan } from "@/lib/users-store";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  plan?: string;
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
};

const PLANS: UserPlan[] = ["free", "pro", "custom"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";
    const plan = (body.plan ?? "free") as UserPlan;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (!PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (plan !== "free") {
      if (!body.cardName || !body.cardNumber || !body.cardExpiry || !body.cardCvc) {
        return NextResponse.json(
          { error: "Card details are required for paid plans." },
          { status: 400 },
        );
      }
    }

    const user = await createUser({
      email,
      password,
      name: name || email.split("@")[0],
      plan,
      authProvider: "credentials",
      cardName: body.cardName,
      cardNumber: body.cardNumber,
      cardExpiry: body.cardExpiry,
      cardCvc: body.cardCvc,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
