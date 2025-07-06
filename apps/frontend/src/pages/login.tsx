import { useState } from "react";
import Link from "next/link";
import { Button, Card, Input } from "~/components";
import { useLogin } from "~/hooks";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "~/constants";
import toast from "react-hot-toast";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useLogin();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: (res) => {
          toast.success("Login successful!");
          localStorage.setItem("token", res.data.token!);
          queryClient.invalidateQueries({
            queryKey: queryKeys.profile,
          });
          router.push("/");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-700 p-3 flex items-center justify-center">
      <Card className="w-96">
        <h1 className="text-center text-xl font-semibold mb-6">
          Login to Live Tracking
        </h1>

        <div className="bg-gray-200 p-2 rounded-md mb-2">
          <p className="text-sm">
            For demonstration purposes, you can use the following credentials:
            <br />
            <br />
            <strong>Email:</strong> demo@example.com
            <br />
            <strong>Password:</strong> password
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            id="email"
            size="small"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <Input
            type="password"
            id="password"
            size="small"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={mutation.isPending}
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
