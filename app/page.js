
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 z-0">
        <Image
          src="/3.png"
          alt="Background Image 1"
          fill
          style={{objectFit: "cover"}}
          className="animate-fade-in-out-1"
        />
        <Image
          src="/2.png"
          alt="Background Image 2"
          fill
          style={{objectFit: "cover"}}
          className="animate-fade-in-out-2"
        />
      </div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-playfair-display">The Italian Bistro</h1>
        <p className="mt-4 text-xl">Experience the taste of Italy.</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-10 text-center text-white">
        <Link href="#about" className="text-2xl animate-bounce">
          ↓
        </Link>
      </div>
      <div id="about" className="bg-white p-20">
        <h2 className="text-4xl font-playfair-display text-center">About Us</h2>
        <p className="mt-4 text-lg text-center">
          Welcome to The Italian Bistro, where we bring the heart of Italy to your table. Our passion for authentic Italian cuisine is reflected in every dish we create. We use only the freshest ingredients, sourced locally and from Italy, to craft traditional recipes that have been passed down through generations.
        </p>
        <div className="text-center mt-8">
          <Link href="/menu" className="px-8 py-3 text-lg font-bold text-white bg-red-700 rounded-full hover:bg-red-800">
            View Our Menu
          </Link>
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-10">
        <div className="container mx-auto text-center">
          <p>Contact us: (123) 456-7890</p>
          <p>Hours: Mon-Sat 11am-10pm, Sun 12pm-9pm</p>
          <p>&copy; 2024 The Italian Bistro. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
