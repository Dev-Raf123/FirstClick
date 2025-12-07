import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { designId } = await request.json();

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ownership check removed: all designs can be equipped by any user

    // Check if user settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let updateError;
    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          equipped_design_id: designId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      updateError = error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({ 
          user_id: user.id,
          equipped_design_id: designId
        });
      updateError = error;
    }

    if (updateError) {
      console.error('Error updating equipped design:', updateError);
      return NextResponse.json(
        { error: 'Failed to equip design' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in equip-design API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
