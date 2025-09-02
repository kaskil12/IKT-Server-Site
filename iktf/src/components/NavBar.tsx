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

export function NavBar() {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          {/* Logo */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <img src={logo} alt="Logo" className="h-10 w-10" />
    
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Dashboard Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    
                
                
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

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            
                <CiChat1 style={{ width: "24px", height: "24px" }} />
           
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            
                <MdOutlineAccountCircle
                  style={{ width: "24px", height: "24px" }}
                />
            
            </NavigationMenuLink>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            
              <MdOutlineAccountCircle
                  style={{ width: "24px", height: "24px" }}
                />
             
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
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
       
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";