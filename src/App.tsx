import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { ProjectDetail } from "./components/dashboard/ProjectDetail";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Home />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/analytics" element={<Home />} />
          <Route path="/team" element={<Home />} />
          <Route path="/docs" element={<Home />} />
          <Route path="/help" element={<Home />} />
          <Route path="/settings" element={<Home />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
