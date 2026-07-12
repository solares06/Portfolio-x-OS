import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const backupData: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      user: user.id
    };

    const tables = [
      "tasks",
      "research_notes",
      "journal_entries",
      "finance_entries",
      "finance_budgets",
      "finance_recurring",
      "body_metrics",
      "gym_exercises",
      "ec_directives",
      "ec_sponsor_pipeline",
      "ec_meeting_notes"
    ];

    for (const table of tables) {
      const { data } = await supabase.from(table).select("*").eq("user_id", user.id);
      backupData[table] = data || [];
    }

    // Convert to JSON buffer
    const jsonStr = JSON.stringify(backupData, null, 2);
    
    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="core_os_backup_${new Date().toISOString().split('T')[0]}.json"`,
      }
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
