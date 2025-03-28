async getActiveSession(): Promise<Session | undefined> {
  try {
    console.log("Getting active session from database");
    
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error in getActiveSession:", error);
      throw error;
    }

    if (!session) {
      console.log("No active session found");
      return undefined;
    }

    // Check if session has expired
    const expiryTime = new Date(session.expires_at).getTime();
    const currentTime = Date.now();
    
    if (currentTime > expiryTime) {
      console.log("Active session found but expired, deactivating:", session.id);
      // Automatically deactivate expired sessions
      await this.expireSession(session.id);
      return undefined;
    }
    
    console.log("Active session found:", session.id);
    return session;
  } catch (error) {
    console.error("Error in getActiveSession:", error);
    throw error;
  }
}

async getAllSessions(): Promise<Session[]> {
  try {
    console.log("Getting all sessions from database");
    
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error in getAllSessions:", error);
      throw error;
    }

    console.log(`Retrieved ${sessions?.length || 0} sessions`);
    return sessions || [];
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    throw error;
  }
} 