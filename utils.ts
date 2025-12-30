export const formatTime = (ms: number): string => {
  const milliseconds = Math.floor((ms % 1000) / 10); // Display 2 digits for ms
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Format: HH:MM:SS.ms
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
};

export const formatAbsoluteTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};