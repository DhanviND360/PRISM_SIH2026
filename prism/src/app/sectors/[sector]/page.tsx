import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/data-provider";
import { SectorProjectView } from "./sector-project-view";

interface SectorPageProps {
  params: Promise<{ sector: string }>;
}

export default async function SectorDetailPage({ params }: SectorPageProps) {
  const { sector: encodedSector } = await params;
  const sector = decodeURIComponent(encodedSector);

  const provider = getDataProvider();
  const allSectors = await provider.getSectors();

  // Find matching sector case-insensitively or exactly
  const matchedSector = allSectors.find(
    (s) => s.toLowerCase() === sector.toLowerCase()
  );

  if (!matchedSector) {
    notFound();
  }

  const projects = await provider.getProjectsBySector(matchedSector);

  return <SectorProjectView sector={matchedSector} projects={projects} />;
}
