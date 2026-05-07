"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import Link from "next/link";
import { useEffect, useState } from "react";

const Page = () => {
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("Name");

  const [users, setUsers] = useState([]);

  const searchType = ["Name", "Role"];

  const usersMock = [
    {
      id: "1",
      name: "JakeJakeJakeJakeJake",
      email: "jake@gmail.com",
      role: "MANDOR",
    },
    {
      id: "124",
      name: "Bart",
      email: "Bart@gmail.com",
      role: "BURUH",
    },
    {
      id: "125",
      name: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa",
      email: "jake@gmail.com",
      role: "MANDOR",
    },
    {
      id: "126",
      name: "Aiden",
      email: "MccaigAideenofTheYardWoohoo@gmail.com",
      role: "ADMIN",
    },
    {
      id: "126",
      name: "Joey",
      email: "Joe@gmail.com",
      role: "DRIVER",
    },
    {
      id: "127",
      name: "Slime",
      email: "Skime@gmail.com",
      role: "BURUH",
    },
    {
      id: "128",
      name: "Ludwig",
      email: "Lud@gmail.com",
      role: "BURUH",
    },
    {
      id: "129",
      name: "Nick",
      email: "nicicici@gmail.com",
      role: "BURUH",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchUsers() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      console.log(data);

      setUsers(data);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    if (searchBy === "Role") {
      return (user.role || "").toLowerCase().includes(q);
    }
    return (user.fullname || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div>Admin Dashboard</div>

      <div>
        <div>List of all users</div>
        <Textarea
          placeholder={`type to filter by ${searchBy?.toLowerCase()}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        ></Textarea>
        <Combobox
          items={searchType}
          value={searchBy}
          onValueChange={setSearchBy}
        >
          <ComboboxInput placeholder="Search type" />
          <ComboboxContent>
            <ComboboxEmpty>no items found</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <div className="h-40 w-fit pr-10 overflow-scroll text-nowrap">
          {filteredUsers.length === 0 && (
            <div className="text-sm text-muted-foreground">no users found</div>
          )}
          {filteredUsers.map((user, i) => (
            <Link href={`/profile/${user.id}`} key={i} className="flex gap-10">
              <div className="w-60 overflow-scroll">
                {i + 1}. {user.fullname}
              </div>
              <div>{user.role}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Page;
