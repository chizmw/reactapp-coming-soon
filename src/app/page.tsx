import EventDashboard from '../components/EventDashboard';

export default function Home() {
  const filterTag = ''; // Change this to filter by different tags

  return (
    <div>
      <h1>Coming Soon</h1>
      <EventDashboard filterTag={filterTag} />
    </div>
  );
}
