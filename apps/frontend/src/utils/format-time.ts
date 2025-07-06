import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function timeAgo(isoString: string) {
  return dayjs(isoString).fromNow();
}
