import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "view/lib/auth";

export async function requireAdminResponse(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
