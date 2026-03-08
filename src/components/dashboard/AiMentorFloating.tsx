"use client";
import { useState, useEffect } from 'react';
import AiMentorChat from './AiMentorChat';

export default function AiMentorFloating() {
    const [subscription, setSubscription] = useState<any>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const res = await fetch('/api/student/overview');
                if (res.ok) {
                    const data = await res.json();
                    setSubscription(data.subscription);
                }
            } catch (e) {
                // silently fail - just won't show AI chat
            } finally {
                setLoaded(true);
            }
        };
        fetchSub();
    }, []);

    if (!loaded) return null;

    return (
        <AiMentorChat
            isSubscriber={!!subscription?.isSubscriber}
            aiQuotaRemaining={subscription?.aiQuotaRemaining ?? 0}
        />
    );
}
