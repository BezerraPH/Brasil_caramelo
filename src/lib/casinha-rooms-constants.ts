export const ROOM_CHANNEL_PREFIX = "private-room-";

export function roomChannelName(roomId: string) {
  return `${ROOM_CHANNEL_PREFIX}${roomId}`;
}
