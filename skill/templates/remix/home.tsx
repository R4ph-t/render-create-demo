import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "{{PROJECT_NAME}}" },
    { name: "description", content: "Built with Remix and deployed on Render" },
  ];
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">{{PROJECT_NAME}}</h1>
      <p className="text-lg text-gray-600">
        Built with Remix. Deployed on Render.
      </p>
    </main>
  );
}
