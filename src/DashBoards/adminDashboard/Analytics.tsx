import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { FaUsers } from 'react-icons/fa';
import { GiPartyPopper } from 'react-icons/gi';
import { MdLocationCity } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { PuffLoader } from 'react-spinners';
import { userApi } from '../../features/APIS/UserApi';
import { eventApi } from '../../features/APIS/EventsApi';
import type { RootState } from '../../App/store';

interface EventData {
  date: string;
  venue?: { name: string };
  category?: string;
  attendance?: number;
}

const cardVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6699', '#33CCFF'];

const getDailyCounts = (items: { createdAt: string }[], days = 7) => {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    counts[dayKey] = 0;
  }
  items.forEach((item) => {
    const dayKey = item.createdAt.slice(0, 10);
    if (dayKey in counts) counts[dayKey]++;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getHourlyCounts = (items: { createdAt: string }[]) => {
  const now = new Date();
  const counts: Record<string, number> = {};
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(now.getHours() - i, 0, 0, 0);
    const hourKey = d.toISOString().slice(0, 13);
    counts[hourKey] = 0;
  }
  items.forEach((item) => {
    const hourKey = item.createdAt.slice(0, 13);
    if (hourKey in counts) counts[hourKey]++;
  });
  return Object.entries(counts).map(([key, value]) => ({
    name: key.split('T')[1] + ':00',
    value,
  }));
};

const isWithinRange = (dateStr: string, start: Date, end: Date): boolean => {
  const date = new Date(dateStr);
  return date >= start && date <= end;
};
export const Analytics = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: users = [], isLoading: usersLoading } = userApi.useGetAllUsersProfilesQuery({ skip: !isAuthenticated });
  const { data: events = [], isLoading: eventsLoading } = eventApi.useGetAllEventsQuery({ skip: !isAuthenticated });

  const usersCount = users.length;
  const eventsCount = events.length;

  const venueBookingFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const venueName = event.venue?.name || 'Unknown Venue';
    venueBookingFrequency[venueName] = (venueBookingFrequency[venueName] || 0) + 1;
  });

  const venuesCount = Object.keys(venueBookingFrequency).length;
  const averageBookingsPerVenue = venuesCount > 0 ? (eventsCount / venuesCount).toFixed(2) : '0';

  const topVenues = Object.entries(venueBookingFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const eventTypeFrequency: Record<string, number> = {};
  events.forEach((event: EventData) => {
    const type = event.category || 'Unknown';
    eventTypeFrequency[type] = (eventTypeFrequency[type] || 0) + 1;
  });

  const popularEventTypes = Object.entries(eventTypeFrequency)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalAttendance = events.reduce((sum: number, ev: any) => sum + (ev.attendance || 0), 0);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const weeklyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfWeek, endOfWeek)
  ).length;

  const monthlyEvents = events.filter((event: EventData) =>
    isWithinRange(event.date, startOfMonth, endOfMonth)
  ).length;

  const userDailyData = getDailyCounts(users, 7);
  const userHourlyData = getHourlyCounts(users);

  const pieData = [
    { name: 'Users', value: usersCount },
    { name: 'Events', value: eventsCount },
    { name: 'Venues', value: venuesCount },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, Admin ${user?.firstName || 'Gajkenye'}!`;
    if (hour < 18) return `Good Afternoon, Admin ${user?.firstName || 'Gajkenye'}!`;
    return `Good Evening, Admin ${user?.firstName || 'Gajkenye'}!`;
  })();
    return (
    <div className="min-h-screen bg-base-200/90 py-12 px-6">
      <div className="container mx-auto space-y-12">

        {/* Greeting Card */}
        <div className="w-full bg-base-300/70 text-base-content p-6 rounded-xl border border-base-content/20 shadow-md text-center">
          <h1 className="text-2xl font-bold text-primary">{greeting}</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <FaUsers size={40} />, label: 'Users', count: usersCount, loading: usersLoading },
            { icon: <MdLocationCity size={40} />, label: 'Venues', count: venuesCount, loading: eventsLoading },
            { icon: <GiPartyPopper size={40} />, label: 'Events', count: eventsCount, loading: eventsLoading },
            { icon: <MdLocationCity size={40} />, label: 'Avg Bookings per Venue', count: averageBookingsPerVenue, loading: false },
            { icon: <GiPartyPopper size={40} />, label: 'Events This Week', count: weeklyEvents, loading: eventsLoading },
            { icon: <GiPartyPopper size={40} />, label: 'Events This Month', count: monthlyEvents, loading: eventsLoading },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="w-full bg-base-300/70 text-base-content p-6 rounded-xl border border-base-content/20 shadow-md flex flex-col items-center justify-center text-center"
            >
              {card.loading ? (
                <PuffLoader color="var(--pf)" size={40} />
              ) : (
                <>
                  <div className="mb-3">{card.icon}</div>
                  <h2 className="text-xl font-semibold text-primary">{card.label}</h2>
                  <p className="text-3xl font-extrabold">{card.count}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
                {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Pie Chart */}
          <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20">
            <h2 className="text-xl font-bold mb-4 text-primary">User, Event & Venue Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Event Type Frequency */}
          <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20">
            <h2 className="text-xl font-bold mb-4 text-primary">Top Event Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularEventTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart: New Users in 7 Days */}
          <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20">
            <h2 className="text-xl font-bold mb-4 text-primary">New Users (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Top Venues */}
          <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20">
            <h2 className="text-xl font-bold mb-4 text-primary">Top Booked Venues</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVenues}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Hourly User Registrations (24hrs) */}
          <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20">
            <h2 className="text-xl font-bold mb-4 text-primary">Users Registered (Last 24 Hours)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userHourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#33CCFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-base-300/70 p-6 rounded-xl shadow-md border border-base-content/20 text-center">
          <h2 className="text-xl font-bold text-primary">Total Attendance Recorded</h2>
          <p className="text-3xl font-extrabold mt-2">{totalAttendance}</p>
        </div>
      </div>
    </div>
  );
};

