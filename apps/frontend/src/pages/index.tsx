import Link from "next/link";
import { Button, Card } from "../components";
import { useAuthData } from "~/context/auth-context";
import { LocateFixed, MapPin } from "lucide-react";

export default function Page() {
  const { user, isAuthenticated } = useAuthData();
  return (
    <div className="min-h-screen bg-gray-700 p-3 flex items-center justify-center">
      <Card className="w-120">
        <h1 className="text-center text-lg font-semibold">
          Simple Live Tracking App
        </h1>
        {isAuthenticated && (
          <div>
            <p className="text-center py-4">Welcome, {user?.name}!</p>
            <div className="flex justify-center gap-2 py-4">
              <Link href="/trackers">
                <Button leftIcon={LocateFixed} variant="primary" size="small">
                  Find Trackers
                </Button>
              </Link>

              <Link href="/track-me">
                <Button leftIcon={MapPin} variant="outline" size="small">
                  Track Me
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div>
            <p className="text-center py-4">Welcome, Guest!</p>
            <div className="flex justify-center gap-2 py-4">
              <Link href="/login">
                <Button variant="primary" size="small">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">version 1.0.0</p>
      </Card>
    </div>
  );
}
