'use client';

import PropTypes from 'prop-types';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { RRule, rrulestr } from 'rrule';

const EventDashboard = ({ filterTag = '' }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/events.json')
      .then((response) => response.json())
      .then((data) => {
        const now = new Date();
        const eventsWithNextOccurrence = data
          .filter((event) => !filterTag || event.tags.includes(filterTag))
          .map((event) => {
            if (event.rrule) {
              console.info('Found rrule');
              try {
                const rule = rrulestr(`DTSTART:${event.start}\n${event.rrule}`);
                const startDate = parseISO(event.start);
                console.log(rule);
                console.log(startDate);

                // Calculate the next occurrence after the current date
                const nextOccurrence = rule.after(now, true);
                console.info(nextOccurrence);
                console.info(
                  `Event: ${event.summary}, Next Occurrence: ${new Date(
                    nextOccurrence
                  ).toLocaleString()}`
                );

                return {
                  ...event,
                  nextOccurrence: nextOccurrence || startDate,
                };
              } catch (error) {
                console.error(
                  `Invalid recurrence rule for event: ${event.summary}`,
                  error
                );
                return { ...event, nextOccurrence: parseISO(event.start) };
              }
            } else {
              // One-time event
              return { ...event, nextOccurrence: parseISO(event.start) };
            }
          });

        // Sort events by next occurrence
        const sortedEvents = eventsWithNextOccurrence.sort(
          (a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence)
        );

        setEvents(sortedEvents);
      });
  }, [filterTag]);

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="event-dashboard">
      {events.map((event, index) => (
        <div key={index} className="event-tile">
          <img src={event.image} alt={event.summary} />
          <div className="content">
            <h2>{event.summary}</h2>
            <h3>{formatDate(event.nextOccurrence)}</h3>
            <h4>
              {formatDistanceToNow(event.nextOccurrence, { addSuffix: true })}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

EventDashboard.propTypes = {
  filterTag: PropTypes.string,
};

export default EventDashboard;
