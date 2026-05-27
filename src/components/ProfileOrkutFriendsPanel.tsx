import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";

type FriendMini = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

type ProfileOrkutFriendsPanelProps = {
  friends: FriendMini[];
  friendCount: number;
};

export function ProfileOrkutFriendsPanel({
  friends,
  friendCount,
}: ProfileOrkutFriendsPanelProps) {
  return (
    <section className="bc-orkut-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-bc-blue">
          Amigos da matilha
        </h2>
        <span className="text-xs text-bc-brown">{friendCount}</span>
      </div>
      {friends.length === 0 ? (
        <p className="text-xs text-bc-brown/80">
          Nenhum amigo público ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {friends.map((f) => (
            <li key={f.id}>
              <Link
                href={`/perfil/${f.username}`}
                className="flex flex-col items-center gap-1 rounded-lg p-1 text-center transition hover:bg-bc-blue/5"
                title={f.name}
              >
                <UserAvatar name={f.name} avatarUrl={f.avatarUrl} size="sm" />
                <span className="line-clamp-1 w-full text-[10px] font-medium text-bc-brown">
                  {f.name.split(" ")[0]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/amigos"
        className="mt-3 block text-center text-xs font-medium text-bc-blue hover:underline"
      >
        Ver todos →
      </Link>
    </section>
  );
}
