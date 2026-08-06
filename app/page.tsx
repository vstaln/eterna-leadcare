import Hero from "@/components/hero";
import PipelineDiagram from "@/components/pipeline-diagram";
import SectionHeading from "@/components/section-heading";

export default function Home() {
  return (
    <div>
      <Hero />
      <section id="pipeline" className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="The Pipeline"
          title="Lead to report card in one flow"
        />
        <PipelineDiagram />
      </section>
    </div>
  );
}
