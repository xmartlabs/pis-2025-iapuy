import React, { useContext } from "react";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming ShadCN Button component
import { Card, CardContent } from "@/components/ui/card"; // Assuming ShadCN Card components
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

// Define the component props
interface MagicLinkDialogProps {
  ci: string;
  username: string;
  registrationCompleted: boolean;
}

export const MagicLinkDialog: React.FC<MagicLinkDialogProps> = ({
  ci,
  username,
  registrationCompleted,
}) => {
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!navigator.clipboard) {
      toast.error(
        "No se pudo copiar el link, parece que no se tiene accesso al clipboard.",
        {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#cfaaaaff",
            border: "1px solid #ec0909ff",
            color: "#ec0909ff",
          },
        }
      );
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`¡ Se copio el magic link con exito !`, {
        duration: 5000,
        icon: null,
        className:
          "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
        style: {
          background: "#DEEBD9",
          border: "1px solid #BDD7B3",
          color: "#121F0D",
        },
      });
      return true;
    } catch (error) {
      toast.error(
        `No se pudo copiar el link: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#cfaaaaff",
            border: "1px solid #ec0909ff",
            color: "#ec0909ff",
          },
        }
      );
    }
    return true;
  };

  const context = useContext(LoginContext)!;

  const handleMagicLinkGeneration = async () => {
    try {
      const resp = await fetchWithAuth(
        context,
        "/api/magic-link",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ci,
            nombre: username,
          }),
        }
      );

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(
          `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
        );
      }

      const data = (await resp.json()) as { magicLink: string };
      await copyToClipboard(data.magicLink);
    } catch (err) {
      toast("No se pudo generar el magic link", {
        description:
          err instanceof Error ? err.message : "Error desconocido al copiar link",
      });
    }
  };

  const baseCardClasses = "w-[512px] h-[160px]";
  const baseIconClasses = "mr-2 h-4 w-4";

  let cardClasses = "";
  const iconComponent = <Info className={baseIconClasses} />;
  let primaryText = "";
  let secondaryText = "";
  const buttonText = "Copiar link";
  let buttonClasses = "";

  if (!registrationCompleted) {
    cardClasses = `${baseCardClasses} border-red-500 text-red-700`;
    primaryText = "Falta un paso para el registro completo";
    secondaryText = `Envíale el siguiente link a ${username} y decile que cree una nueva contraseña ahí.`;
    buttonClasses =
      "text-red-500 border-red-500 hover:bg-red-50 focus:ring-red-500";
  } else {
    cardClasses = `${baseCardClasses} border-green-500 text-gray-800`;
    primaryText = `Si ${username} necesita una nueva contraseña,`;
    secondaryText =
      "enviale este link y decile que cree una nueva contraseña ahí.";
    buttonClasses =
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500";
  }

  return (
    <Card className={cardClasses}>
      <CardContent className="">
        <div className="flex items-start mb-2">
          {iconComponent}
          <div className="flex flex-col ml-1">
            <p
              className={` ${
                !registrationCompleted ? "text-red-700" : "text-gray-800"
              }`}
            >
              {primaryText}
            </p>

            {!registrationCompleted ? (
              <p className="text-sm mt-1 text-red-700">{secondaryText}</p>
            ) : (
              <p className="text-sm text-gray-700">
                <span className="text-sm text-gray-700">
                  enviale este link y decile que cree una nueva contraseña ahí.
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant={!registrationCompleted ? "outline" : "default"}
            className={buttonClasses}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => handleMagicLinkGeneration()}
          >
            <Copy className="" />
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
