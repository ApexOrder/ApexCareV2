import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

export function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    // Initialize with empty data structure if file doesn't exist
    const initialData = {
      users: [],
      serviceUsers: [],
      visits: [],
      tasks: [],
      groups: [],
      timeline_events: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error parsing DB file:", error);
    return {
      users: [],
      serviceUsers: [],
      visits: [],
      tasks: [],
      groups: [],
      timeline_events: []
    };
  }
}

export function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving DB file:", error);
    return false;
  }
}