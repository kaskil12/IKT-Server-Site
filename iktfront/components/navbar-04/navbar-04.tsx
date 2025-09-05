import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";

const Navbar04Page = () => {
  return (
    <div className="mb-30">
      <nav className="fixed top-6 inset-x-4 h-16 max-w-screen-xl mx-auto rounded-full bg-white/10 backdrop-blur-md shadow-md">
        <div className="h-full flex items-center justify-between mx-auto px-4 ">
          <div className="flex items-center gap-3">
            <img src="/logo.png" width={32} height={32} />
            <p className="text-white font-semibold">IKT Elvis</p>
          </div>
          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden sm:inline-flex rounded-full cursor-pointer"
            >
              Sign In
            </Button>
            {/* <Button className="rounded-full">Get Started</Button> */}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar04Page;
