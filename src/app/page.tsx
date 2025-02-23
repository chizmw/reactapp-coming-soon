'use client';

import React, { useState, useEffect } from 'react';

import EventDashboard from '@/components/EventDashboard';
import { EventItem } from '@/interfaces/Data';

export default function Home() {
  const [loadedJsonData, setLoadedJsonData] = useState<EventItem[]>();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('selectedTags');
    return savedTags ? JSON.parse(savedTags) : [];
  });
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>('Coming Soon');

  // Fetch the JSON data
  /*
  useEffect(() => {
    fetch('/events.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch events: ' + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        // Add 'guid' property to each event
        data.forEach((event: EventItem) => {
          event.guid = crypto.randomUUID();
        });
        setLoadedJsonData(data);
      })
      .catch((error) => {
        console.error('Caught: Error fetching events:', error);
        setPageTitle('Error');
        setError('Failed to load events. Please try again later.');
      });
  }, []);
  */
  useEffect(() => {
    const loadEvents = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch events: ' + response.statusText);
        }
        const data = await response.json();
        // Add 'guid' property to each event
        data.forEach((event: EventItem) => {
          event.guid = crypto.randomUUID();
        });
        console.log('Loaded events from', url);
        setLoadedJsonData(data);
      } catch (error) {
        console.error('Error fetching events from', url, ':', error);
        throw error;
      }
    };

    loadEvents('/events.json').catch(() => {
      // Fallback to example-events.json if the initial fetch fails
      loadEvents('/example-events.json')
        .then(() => {
          // make it obvious that we're using sample data
          setPageTitle('Sample Data');
          // make sure we aren't hiding events due to (previous) tag filter
          setSelectedTags([]);
        })
        .catch(() => {
          setError('Failed to load events. Please try again later.');
        });
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

  if (error) {
    return (
      <div>
        <h1>{pageTitle}</h1>
        <div className="error-message">{error}</div>;
      </div>
    );
  }

  return (
    <div>
      <h1>{pageTitle}</h1>
      {loadedJsonData ? (
        <EventDashboard
          jsonData={loadedJsonData}
          knownTags={allTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
