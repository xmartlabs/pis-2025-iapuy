import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Migas() {
  return (
    <Breadcrumb className="gap-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="../personas/listado"
            className="gray-500 p-0 gap-0 text-sm leading-5"
          >
            Personas
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="border-muted-foreground" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-sans font-semibold text-foreground p-0 gap-0 text-sm leading-5">
            Nueva persona
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
