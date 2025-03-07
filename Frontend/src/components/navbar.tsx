"use client";

import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "./icons/logo.png";
import { MdOutlineAccountCircle } from "react-icons/md";
import { CiChat1 } from "react-icons/ci";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Placeholder components
const DashboardHome = () => <div>Dashboard Home</div>;
const DashboardStats = () => <div>Dashboard Statistics</div>;
const Account = () => <div>Account Page</div>;
const About = () => <div>About Page</div>;
const Chat = () => <div>Chat Page</div>;

const dashboardItems = [
  {
    title: "Overview",
    to: "/dashboard",
    description: "View your main dashboard with key metrics",
  },

  {
    title: "Statistics",
    to: "/dashboard/stats",
    description: "Detailed statistics and analytics",
  },
  {
    title: "Settings",
    to: "/dashboard/settings",
    description: "Configure your dashboard preferences",
  },
];

export function NavigationMenuDemo() {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          {/* Logo */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/">
                <img src={logo} alt="Logo" className="h-10 w-8" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Dashboard Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      to="/dashboard"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Dashboard
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Central hub for your account overview and analytics
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                {dashboardItems.map((item) => (
                  <ListItem key={item.title} to={item.to} title={item.title}>
                    {item.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Simple Links */}

          {/* <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link to="/about">About</Link>
            </NavigationMenuLink>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link to="/chat">
                <CiChat1 style={{ width: "24px", height: "24px" }} />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link to="/account">
                <MdOutlineAccountCircle
                  style={{ width: "24px", height: "24px" }}
                />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Routes>
        <Route path="/dashboard" />
        <Route path="/dashboard/stats" />
        <Route path="/account" />
        {/* <Route path="/about" /> */}
        <Route path="/chat" />
      </Routes>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
