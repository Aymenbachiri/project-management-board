import { getApiDocs } from "@/lib/utils/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
  const spec = await getApiDocs();

  return (
    <section className="container mx-auto w-full">
      <ReactSwagger spec={spec} />
    </section>
  );
}
