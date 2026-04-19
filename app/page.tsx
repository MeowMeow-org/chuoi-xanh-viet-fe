import { Suspense } from "react";

import HomeClient from "./home-client";

// ConsumerLayout dùng useSearchParams ở client — bọc Suspense để Next không prerender
// fail khi build.
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
