import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone} from "lucide-react";
import Image from "next/image";
interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const LoginDialog= ({ open, onOpenChange }: LoginDialogProps) =>(
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
            className="w-[423px] h-[203px] rounded-[8px] border border-[#D4D4D4] 
                    shadow-[0_4px_6px_-4px_#0000001A,0_10px_15px_-3px_#0000001A] 
                    opacity-100 flex flex-col"
            >
            <DialogHeader className="w-full h-[112px] opacity-100 gap-1.5 flex flex-col items-start text-left">
                <DialogTitle className="font-semibold text-lg leading-[100%] tracking-[-0.025em]">
                    Recuperar contraseña
                </DialogTitle>
                <DialogDescription>
                    <span className="font-normal text-sm leading-5 tracking-normal text-black">
                    Ponete en contacto con IAPUy para poder recuperar tu contraseña.
                    </span>
                </DialogDescription>
                <div className="w-full flex items-center gap-2 opacity-100">
                    <Phone className="w-4 h-4" />
                    <span className="font-normal text-sm leading-5 tracking-normal">987654321</span>
                </div>
            </DialogHeader>

            <DialogFooter className="mt-auto">
                <div className="flex justify-between w-full">
                    <DialogClose asChild>
                        <Button 
                            type="button"
                            className="w-[80px] h-[40px] flex-none rounded-md bg-white border border-[#BDD7B3] 
                                        text-[#5B9B40] text-sm font-medium leading-6 tracking-normal 
                                        hover:bg-[#EFF5EC] transition-colors"
                            >
                            Volver
                        </Button>
                    </DialogClose>

                    <Button
                        asChild
                        className="min-w-[80px] h-[40px] flex-none rounded-md bg-[#5B9B40] text-white text-sm font-medium 
                                    leading-6 tracking-normal hover:bg-[#4F8736] transition-colors px-4 py-2 flex items-center gap-2"
                        >
                        <a
                            href="https://wa.me/598987654321"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                            >
                            <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} />
                            Ir a Whatsapp
                        </a>
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog> 
);