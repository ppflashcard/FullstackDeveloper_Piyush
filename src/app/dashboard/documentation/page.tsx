import { DocumentationContent } from "@/components/dashboard/documentation-content";
import { getAppBaseUrl } from "@/lib/app-url";

export default function DocumentationPage() {
  return <DocumentationContent baseUrl={getAppBaseUrl()} />;
}
