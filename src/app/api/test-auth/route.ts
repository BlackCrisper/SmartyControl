import { NextResponse } from "next/server";
import { users } from "@/lib/auth/mock-users";

export async function GET() {
  try {
    // Check if users exists and has data
    const userCount = users.length;

    return NextResponse.json({
      status: "success",
      message: "Authentication system is correctly configured",
      userCount,
      sampleUser: {
        email: users[0].email,
        password: users[0].password
      },
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL
      }
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Error checking authentication configuration"
      },
      { status: 500 }
    );
  }
}
