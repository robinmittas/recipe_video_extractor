import Nav from "@/components/Nav";
import WakeUpLoader from "@/components/WakeUpLoader";

export default function LibraryLoading() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 pt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-32 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-9 w-20 rounded-xl bg-white/10 animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-xl bg-white/10 animate-pulse mb-8" />
        <WakeUpLoader />
      </main>
    </div>
  );
}
