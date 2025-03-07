import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoMdSend } from "react-icons/io";
export function InputButton() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="Message" />
      <Button type="submit">
        <IoMdSend />
      </Button>
    </div>
  );
}
