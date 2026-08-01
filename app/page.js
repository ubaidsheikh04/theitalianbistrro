import Image from "next/image";

export default function Page() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Image
        src="/2.png"
        alt="Background 1"
        fill
        priority
        className="absolute inset-0 object-cover animate-cross-fade-1"
      />

      <Image
        src="/3.png"
        alt="Background 2"
        fill
        priority
        className="absolute inset-0 object-cover animate-cross-fade-2"
      />
    </div>
  );
}
