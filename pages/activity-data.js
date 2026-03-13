// In a real application, you would fetch data from your database.
// This is a mock API endpoint that generates dynamic data on each request
// to simulate fetching from a live data source.

function getRealData() {
  const data = [];
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dayName = days[date.getDay()];

    // Simulate some activity data for each day
    const visits = Math.floor(Math.random() * 20) + 5; // 5 to 25 visits
    const notes = Math.floor(Math.random() * 15) + 3;  // 3 to 18 notes
    const tasks = Math.floor(Math.random() * 30) + 10; // 10 to 40 tasks

    data.push({
      name: dayName,
      date: date.toISOString().split('T')[0],
      visits,
      notes,
      tasks,
    });
  }
  return data;
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const activityData = getRealData();
    res.status(200).json(activityData);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}