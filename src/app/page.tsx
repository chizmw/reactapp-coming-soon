'use client';

import { useState, useEffect } from 'react';

import EventDashboard from '@/components/EventDashboard';
import { EventItem } from '@/interfaces/Data';

export default function Home() {
  const [loadedJsonData, setLoadedJsonData] = useState<EventItem[]>();
  const [allTags, setAllTags] = useState<string[]>([]);

  // Fetch the JSON data
  useEffect(() => {
    fetch('/events.json')
      .then((response) => response.json())
      .then((data) => {
        // add 'guid' property to each event
        data.forEach((event: EventItem) => {
          event.guid = crypto.randomUUID();
        });
        setLoadedJsonData(data);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, []);

  // Extract unique tags
  useEffect(() => {
    if (loadedJsonData && loadedJsonData.length > 0) {
      const tagsSet = new Set(
        loadedJsonData?.flatMap((event) => event.tags || [])
      );
      setAllTags(Array.from(tagsSet).sort((a, b) => a.localeCompare(b)));
    }
  }, [loadedJsonData]);

  return (
    <div>
      <h1>Coming Soon</h1>
      {loadedJsonData ? (
        <EventDashboard
          jsonData={loadedJsonData}
          knownTags={allTags}
          selectedTags={[]}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
