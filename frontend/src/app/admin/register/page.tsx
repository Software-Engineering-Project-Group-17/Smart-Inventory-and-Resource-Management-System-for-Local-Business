"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Input from "@/components/admin/Input";
import Image from "next/image";

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen w-full relative">
      <div className="hidden h-full w-1/2 bg-primaryColor items-center justify-center sm:flex relative">
        <Image src="/logo.png" fill alt="" className="object-cover" />
      </div>
      <div className="flex flex-col items-center w-full h-full sm:w-1/2 py-14 px-5">
        <div className="size-full flex flex-col items-center p-6 relative">
          {/* TOP PART */}
          <div className="h-1/5 justify-center gap-5 items-center flex flex-col w-full">
            <h1 className="font-bold text-3xl handwriting text-textLight">
              Our Inventory
            </h1>
            <h2 className="heebo font-medium text-lg text-textLight">
              Streamline your business operations
            </h2>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center h-3/5 w-2/3 justify-center gap-6 relative"
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="mt-6 px-10 py-2 bg-textLight text-white rounded-4xl text-center text-lg heebo font-semibold hover:bg-textDark transition-colors"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="h-1/5 w-full items-center justify-center flex flex-col gap-3">
            <p className="heebo font-light text-textLight">
              Have an account in{" "}
              <span className="handwriting text-textLight font-medium">
                Our Inventory
              </span>
              ?{" "}
              <a
                href="/admin/login"
                className="text-textDark underline heebo font-medium hover:text-amber-600 transition-colors"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
