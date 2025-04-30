const clientId = 'whats-track-1';

useEffect(() => {
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('timestamp', { ascending: false });

    setMessages(data || []);
  };

  fetchMessages();

  const channel = supabase
    .channel('realtime:messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `client_id=eq.${clientId}`
      },
      payload => {
        setMessages(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
