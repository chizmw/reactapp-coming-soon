'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { RRule } from 'rrule';
import PropTypes from 'prop-types';

const formatDate = (date) => {
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const EventDashboard = ({ selectedTags = [] }) => {
  const [events, setEvents] = useState([]);
  const [fetchedData, setFetchedData] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Fetch the JSON data
  useEffect(() => {
    fetch('/events.json')
      .then((response) => response.json())
      .then((data) => {
        setFetchedData(data);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, []);

  // Extract unique tags
  useEffect(() => {
    if (fetchedData.length > 0) {
      const tagsSet = new Set(fetchedData.flatMap((event) => event.tags || []));
      setAllTags(Array.from(tagsSet));
    }
  }, [fetchedData]);

  // Process events
  useEffect(() => {
    if (fetchedData.length > 0 && allTags.length > 0) {
      console.log('allTags:', allTags);
      const now = new Date();
      const eventsWithNextOccurrence = fetchedData
        .filter((event) =>
          selectedTags.length > 0
            ? selectedTags.some((tag) => event.tags.includes(tag))
            : true
        )
        .map((event) => {
          if (event.recurrence) {
            try {
              const ruleString = event.recurrence.trim();
              const rule = new RRule(ruleString);
              const startDate = parseISO(event.start);
              rule.options = { dtstart: startDate, tzid: event.timezone };

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
        });

      const sortedEvents = eventsWithNextOccurrence.sort(
        (a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence)
      );

      setEvents(sortedEvents);
    }
  }, [fetchedData, allTags]);

  return (
    <div className="event-dashboard">
      {events.map((event, index) => (
        <div key={event.summary} className="event-tile">
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
  );
};

EventDashboard.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string),
};

export default EventDashboard;
