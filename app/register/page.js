"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const Page = () => {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [job, setJob] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !job ||
      !fullname ||
      !username ||
      !password ||
      (job === "Mandor" && !certificationNumber)
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s

    const payload = { role: job.toUpperCase(), fullname, username, password };

    if (job === "Mandor") {
      payload.certificationNumber = certificationNumber;
    }

    console.log(payload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Registration failed" };
      }

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Registered successfully, please login");
      router.push("/login");
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Request timed out");
        return;
      }

      toast.error("Error. Please try again.");
    }
  };

  const AccountTypes = ["Buruh", "Mandor", "Supir"];

  return (
    <div className="w-100 mx-auto">
      <Button onClick={() => router.back()} className="w-24 mb-4  mt-20">
        ← Back
      </Button>
      <form
        onSubmit={handleRegister}
        className="p-8 w-120 gap-2 flex flex-col border-primary border-2 shadow-xl rounded-xl "
      >
        <div className="font-semibold text-center text-xl mb-8">Register</div>
        <Label>Select your job</Label>
        <div className="mb-4">
          <Combobox items={AccountTypes} value={job} onValueChange={setJob}>
            <ComboboxInput placeholder="What is your job" />
            <ComboboxContent>
              <ComboboxEmpty>No jobs found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        {job === "Mandor" ? (
          <>
            <Label>Enter certification number</Label>
            <Input
              value={certificationNumber}
              onChange={(e) => setCertificationNumber(e.target.value)}
              placeholder="Certification number"
              required
              className="mb-4"
            />
          </>
        ) : (
          ""
        )}
        <Label>Enter full name</Label>
        <Input
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="Full name"
          required
          className="mb-4"
        />
        <Label>Enter username</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="mb-4"
        />
        <Label>Enter password</Label>
        <div className="flex gap-4">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <Button onClick={togglePasswordVisibility} type="button">
            {showPassword ? <Eye /> : <EyeClosed />}
          </Button>
        </div>
        <Button className="w-36 mt-8 self-center" type="submit">
          Register
        </Button>
      </form>
    </div>
  );
};

export default Page;
