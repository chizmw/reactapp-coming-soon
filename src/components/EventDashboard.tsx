'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { parseISO, formatDistanceToNow, isToday } from 'date-fns';
import { rrulestr } from 'rrule';
import { Repeat } from '@mui/icons-material';

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
  if (event.rrule) {
    try {
      const ruleString = event.rrule.trim();
      const rule = rrulestr(`DTSTART:${event.start}\n${ruleString}`);
      const startDate = parseISO(event.start);
      const nextOccurrence = rule.after(startOfToday(), true);
      const nextOccurrenceDate = nextOccurrence || startDate;
      return { ...event, nextOccurrence: nextOccurrenceDate, rule: rule };
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

function startOfToday() {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return startOfToday;
}

function removePastEvents(events: EventItem[]) {
  // we still want to show today's events even if they happened earlier the
  // same day we're viewing
  const today = startOfToday();
  return events.filter((event) => event.nextOccurrence >= today);
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

    const futureEvents = removePastEvents(eventsWithNextOccurrence);

    const sortedEvents = sortEvents(futureEvents);

    setBoardEvents(sortedEvents);
  }, [jsonData, knownTags, selectedTags]);

  useEffect(() => {
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
  }, [selectedTags]);

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
        {boardEvents.map((event) => (
          <div key={event.guid} className="event-tile">
            <img src={event.image} alt={event.summary} />
            <Image
              src={event.image}
              alt={event.summary}
              width={300}
              height={300}
            />
            <div className="content">
              <h2>{event.summary}</h2>
              <h3>{formatDate(event.nextOccurrence)}</h3>
              <h3>
                {isToday(event.nextOccurrence)
                  ? 'Today'
                  : formatDistanceToNow(event.nextOccurrence, {
                      addSuffix: true,
                    })}
              </h3>
              {event.rule && (
                <span title={event.rule.toText()}>
                  <Repeat className="repeat-icon" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDashboard;
