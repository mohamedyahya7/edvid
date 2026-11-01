export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return "الآن";
  }

  const intervals = [
    { seconds: 31536000, singular: "سنة", plural: "سنوات" },
    { seconds: 2592000, singular: "شهر", plural: "أشهر" },
    { seconds: 86400, singular: "يوم", plural: "أيام" },
    { seconds: 3600, singular: "ساعة", plural: "ساعات" },
    { seconds: 60, singular: "دقيقة", plural: "دقائق" },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      const unit = count === 1 ? interval.singular : interval.plural;
      return `منذ ${count} ${unit}`;
    }
  }

  const count = Math.floor(seconds);
  const unit = count === 1 ? "ثانية" : "ثواني";
  return `منذ ${count} ${unit}`;
}
