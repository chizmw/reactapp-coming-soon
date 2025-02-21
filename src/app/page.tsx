'use client';

import EventDashboard from '../components/EventDashboard';
import { useState } from 'react';

export default function Home() {
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <div>
      <h1>Coming Soon</h1>
      <EventDashboard
        selectedTags={selectedTags}
        onTagSelect={setSelectedTags}
      />
    </div>
  );
}
