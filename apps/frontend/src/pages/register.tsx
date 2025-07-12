import { useState } from "react";
import Link from "next/link";
import { Button, Card, Input } from "~/components";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useRegister } from "~/hooks";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setFirstName] = useState("");

  const mutation = useRegister();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    mutation.mutate(
      {
        email,
        password,
        name,
      },
      {
        onSuccess: () => {
          toast.success("Registration successful! Please login to continue.");
          router.push("/login");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-700 p-3 flex items-center justify-center">
      <Card className="w-96">
        <h1 className="text-center text-xl font-semibold mb-6">
          Register for Live Tracking
        </h1>

        <div className="bg-blue-100 p-2 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            Create your account to start tracking and sharing your location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            id="name"
            size="small"
            label="Name"
            value={name}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="John"
          />

          <Input
            type="email"
            id="email"
            size="small"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john.doe@example.com"
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
            minLength={6}
          />

          <Input
            type="password"
            id="confirmPassword"
            size="small"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            minLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-500 hover:underline mb-2 block"
          >
            Already have an account? Login here
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
