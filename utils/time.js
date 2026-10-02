export const shouldRefresh = () => {
  const istTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const istHour = Number(
    istTime.find(part => part.type === 'hour').value
  );

  // Refresh only between 10:00 AM and 10:00 PM IST
  return istHour >= 10 && istHour < 22;
};
