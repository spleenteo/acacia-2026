export default function Loading() {
  return (
    <div className="min-h-screen bg-heading flex items-center justify-center px-5">
      <div className="text-center text-white w-full max-w-2xl">
        <p className="font-heading font-extralight text-alpha text-white/20 tracking-[0.2em] uppercase mb-8 animate-pulse">
          Acacia
        </p>
        <div className="space-y-3 animate-pulse">
          <div className="h-1 bg-white/10 rounded-full w-full mx-auto" />
          <div className="h-1 bg-white/6 rounded-full w-3/4 mx-auto" />
          <div className="h-1 bg-white/4 rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}
