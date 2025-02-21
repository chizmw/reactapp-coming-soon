'use client';

import { useState, useEffect } from 'react';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { rrulestr } from 'rrule';

import { EventItem } from '@/interfaces/Data';
import TagFilter from '@/components/TagFilter';

interface EventDashboardProps {
  jsonData: EventItem[];
  knownTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const formatDate = (date: Date) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString(undefined, formatOptions);
};

function prepareEvent(event: EventItem) {
  const now = new Date();
  if (event.rrule) {
    try {
      const ruleString = event.rrule.trim();
      const rule = rrulestr(`DTSTART:${event.start}\n${ruleString}`);
      const startDate = parseISO(event.start);
      const nextOccurrence = rule.after(now, true);
      const nextOccurrenceDate = nextOccurrence || startDate;
      return { ...event, nextOccurrence: nextOccurrenceDate };
    } catch (error) {
      console.error(
        `Invalid recurrence rule for event: ${event.summary}`,
        error
      );
      return { ...event, nextOccurrence: parseISO(event.start) };
    }
  } else {
    const nextOccurrenceDate = parseISO(event.start);
    return { ...event, nextOccurrence: nextOccurrenceDate };
  }
}

function sortEvents(events: EventItem[]) {
  return events.sort(
    (a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime()
  );
}

const EventDashboard = ({
  jsonData,
  knownTags,
  selectedTags,
  setSelectedTags,
}: EventDashboardProps) => {
  const [boardEvents, setBoardEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const filteredEvents = jsonData.filter((event) =>
      selectedTags.length > 0
        ? selectedTags.some((tag) => event.tags.includes(tag))
        : true
    );

    const eventsWithNextOccurrence = filteredEvents.map((event) => {
      return prepareEvent(event);
    });

    const sortedEvents = sortEvents(eventsWithNextOccurrence);

    setBoardEvents(sortedEvents);
  }, [jsonData, knownTags]);

  console.info(jsonData);
  console.info(knownTags);
  return (
    <div>
      <TagFilter
        allTags={knownTags}
        onTagSelect={setSelectedTags}
        selectedTags={selectedTags}
      />
      <div className="event-dashboard">
        {boardEvents.map((event, index) => (
          <div key={event.guid} className="event-tile">
            <img src={event.image} alt={event.summary} />
            <div className="content">
              <h2>{event.summary}</h2>
              <h3>{formatDate(event.nextOccurrence)}</h3>
              <h3>
                {formatDistanceToNow(event.nextOccurrence, { addSuffix: true })}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDashboard;
