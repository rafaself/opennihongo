import { getParticleLesson } from "@opennihongo/content";
import { Outlet, useParams } from "@tanstack/react-router";
import { ParticlesOverview } from "../../features/particles/ParticlesOverview";
import { ParticleReader } from "../../features/particles/ParticleReader";
import { NotFoundPage } from "../NotFoundPage";
import "../../features/particles/particles.css";

export function ParticlesSectionPage() {
  return <Outlet />;
}

export function ParticlesOverviewPage() {
  return <ParticlesOverview />;
}

export function ParticleLessonPage() {
  const { particleId } = useParams({ from: "/particles/$particleId" });
  const lesson = getParticleLesson(particleId);
  return lesson ? (
    <ParticleReader key={lesson.id} lesson={lesson} />
  ) : (
    <NotFoundPage />
  );
}
