export function formatActivityDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Helper to get specific mock dates based on relative time labels
export function getMockDate(relativeLabel: string): Date {
  const now = new Date();
  if (relativeLabel.includes('h ago')) {
    const hours = parseInt(relativeLabel.split('h')[0], 10) || 1;
    now.setHours(now.getHours() - hours);
  } else if (relativeLabel.includes('Yesterday')) {
    now.setDate(now.getDate() - 1);
  } else if (relativeLabel.includes('days ago')) {
    const days = parseInt(relativeLabel.split('d')[0], 10) || 2;
    now.setDate(now.getDate() - days);
  }
  return now;
}
