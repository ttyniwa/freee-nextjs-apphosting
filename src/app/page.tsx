import { SignIn } from "@/auth/SignIn";
import { getServerSession } from "@/auth/getServerSession";
import { prettyPrintJson } from "pretty-print-json";

export default async function Home() {
  const session = await getServerSession();
  return (
    <main className="flex gap-4 min-h-screen flex-col items-center p-24">
      <div className="p-8 rounded border border-gray-200">
        <h1 className="font-medium text-3xl">Session</h1>
        <p
          className="text-gray-300 mt-6"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(session) }}
        />
        <div className="space-x-4 mt-8">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
