import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="relative h-screen overflow-hidden">
        {/* Images */}
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

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35 z-10" />

        {/* Hero Content */}
        <div className="absolute z-20 top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center px-6">
          <h1
            className="text-white font-[var(--font-playfair)]
                       text-6xl md:text-8xl lg:text-9xl
                       font-semibold tracking-wide"
            style={{
              textShadow: "0 5px 25px rgba(0,0,0,0.8)",
            }}
          >
            The Italian Bistrro
          </h1>

          <p
            className="mt-5 text-white italic
                       text-xl md:text-3xl"
            style={{
              textShadow: "0 3px 15px rgba(0,0,0,0.9)",
            }}
          >
            Authentic Italian Cuisine
          </p>

          <div className="mt-8 w-24 h-px bg-white"></div>

          <p
            className="mt-8 uppercase
                       tracking-[0.6em]
                       text-white
                       text-sm md:text-lg"
            style={{
              textShadow: "0 3px 15px rgba(0,0,0,0.9)",
            }}
          >
            EST. 2026 • FINE DINING
          </p>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-[#f8f1e7] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Image
                    src="/2.png"
                    width={300}
                    height={300}
                    alt="Restaurant interior"
                    className="rounded-lg object-cover aspect-square"
                />
                <Image
                    src="/3.png"
                    width={300}
                    height={300}
                    alt="Italian food"
                    className="rounded-lg object-cover aspect-square"
                />
                <Image
                    src="/3.png"
                    width={300}
                    height={300}
                    alt="Restaurant detail"
                    className="rounded-lg object-cover aspect-square"
                />
                <Image
                    src="/2.png"
                    width={300}
                    height={300}
                    alt="More food"
                    className="rounded-lg object-cover aspect-square"
                />
            </div>

            {/* Text Content */}
            <div className="text-left">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#555]">About Us</h2>
              <h3 className="text-4xl font-[var(--font-playfair)] text-[#333] mt-2">Welcome to The Italian Bistro</h3>
              <p className="mt-6 text-base text-[#555] leading-relaxed">
                At The Italian Bistro, we believe dining is more than just food – it is an experience. Our name is a promise of a warm welcome, and that is exactly what we offer every guest who walks through our doors.
              </p>
              <p className="mt-4 text-base text-[#555] leading-relaxed">
                Located in the heart of Flavor Town, we bring you the authentic essence of Italy through carefully crafted flavors, inviting ambiance, and heartfelt hospitality. Our team is passionate about creating a space where tradition meets modern comfort, a memorable culinary journey.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="text-6xl font-bold text-[#333] font-[var(--font-playfair)] pr-4 border-r-2 border-[#c89d7c]">10</div>
                <div>
                  <span className="block text-md font-semibold text-[#333]">Years of</span>
                  <span className="block text-md font-semibold uppercase tracking-wider text-[#333]">Culinary Experience</span>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* What We Serve Section */}
      <div className="py-20 px-6 text-center">
        <h2 className="text-4xl font-[var(--font-playfair)] text-[#333]">What We Serve</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="border p-6 rounded-lg">
            <h3 className="text-2xl font-semibold">Pasta</h3>
            <p className="mt-2">Classic Spaghetti Carbonara, Fettuccine Alfredo, and more.</p>
          </div>
          <div className="border p-6 rounded-lg">
            <h3 className="text-2xl font-semibold">Pizza</h3>
            <p className="mt-2">Margherita, Pepperoni, and specialty pizzas from our wood-fired oven.</p>
          </div>
          <div className="border p-6 rounded-lg">
            <h3 className="text-2xl font-semibold">Desserts</h3>
            <p className="mt-2">Tiramisu, Cannoli, and Panna Cotta to finish your meal.</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-[#f8f1e7] py-20 px-6 text-center">
        <h2 className="text-4xl font-[var(--font-playfair)] text-[#333]">Reviews</h2>
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-lg text-[#555]">"The best Italian food I've had outside of Italy!" - Jane Doe</p>
          <p className="mt-4 text-lg text-[#555]">"A wonderful atmosphere and even better food." - John Smith</p>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-[#333] text-white py-20 px-6 text-center">
        <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#c89d7c]">Our Location</h3>
        <h2 className="text-5xl font-[var(--font-playfair)] mt-2">Find Us Here</h2>
        <div className="mt-8 max-w-2xl mx-auto">
            <iframe 
                width="100%" 
                height="150" 
                style={{border:0, borderRadius: '12px'}} 
                loading="lazy" 
                allowFullScreen 
                src="https://maps.google.com/maps?q=16.23095213194135,74.3440107738333&hl=en&z=14&output=embed">
            </iframe>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white pt-20 pb-8 px-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-[var(--font-playfair)]">We look forward to your visit!</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 text-left border-b border-gray-700 pb-8">
          
          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg text-[#c89d7c]">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#">About Us</a></li>
              <li><Link href="/owner">Owner Dashboard</Link></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Condition</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg text-[#c89d7c]">Contact</h3>
            <address className="mt-4 not-italic space-y-2">
              <p>The Italian Bistro</p>
              <p>321, ABC, Gadhinglaj.</p>
              <p>411119</p>
            </address>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-semibold text-lg text-[#c89d7c]">Opening Hours</h3>
            <div className="mt-4 space-y-2">
              <p><span className="font-semibold">Tuesday - Sunday</span></p>
              <p>6:00 PM – 11:00 PM</p>
              <p><span className="font-semibold">Monday</span></p>
              <p>Closed</p>
            </div>
          </div>

          {/* Connect us */}
          <div>
            <h3 className="font-semibold text-lg text-[#c89d7c]">Connect us</h3>
            <div className="mt-4 flex space-x-4">
              <a href="#">IG</a>
              <a href="#">FB</a>
              <a href="#">WA</a>
              <a href="#">EM</a>
            </div>
          </div>

          {/* Restaurant Policy */}
          <div>
            <h3 className="font-semibold text-lg text-[#c89d7c]">Restaurant Policy</h3>
            <div className="mt-4 space-y-2">
                <p>No Pets</p>
                <p>No Smoking</p>
                <p className="mt-4">Reservations by phone and email only.</p>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto flex justify-between items-center pt-8 text-sm">
          <p>&copy; The Italian Bistro, All Right Reserved.</p>
          <p>
            Designed By <a href="https://wa.me/919175282915" target="_blank" rel="noopener noreferrer" className="text-[#c89d7c] hover:underline">ubaidSHEIKH</a>
          </p>
        </div>
      </footer>
    </>
  );
}
