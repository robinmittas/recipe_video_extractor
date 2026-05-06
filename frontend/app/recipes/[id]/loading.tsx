import Nav from "@/components/Nav";
import WakeUpLoader from "@/components/WakeUpLoader";

export default function RecipeLoading() {
  return (
    <div className="min-h-screen pb-16">
      <Nav />
      <div className="max-w-lg mx-auto">
        {/* Placeholder for screenshot */}
        <div className="aspect-video w-full bg-white/5 animate-pulse" />
        <div className="px-4 pt-5">
          <WakeUpLoader />
        </div>
      </div>
    </div>
  );
}
