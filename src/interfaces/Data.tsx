export interface EventItem {
  guid: string;
  summary: string;
  start: string;
  rrule: string;
  tags: string[];
  image: string;
  nextOccurrence: Date;
}
