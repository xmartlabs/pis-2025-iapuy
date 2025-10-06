import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
interface props {
  link: [string, string];
  current: string;
  className: string;
}
export default function CustomBreadCrumb({ link, current, className }: props) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="../personas/listado"
            className="gray-500 p-0 gap-0 text-sm leading-5"
          >
            <Link href={link[0]}>{link[1]}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="border-muted-foreground" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-sans font-semibold text-foreground p-0 gap-0 text-sm leading-5">
            {current}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
