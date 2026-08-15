'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const heroRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const desktopVideo = desktopVideoRef.current;
    const mobileVideo = mobileVideoRef.current;

    if (!hero || !desktopVideo || !mobileVideo) return;

    const PIXELS_PER_SECOND = 1000;

    let animationHeight = 0;
    let ticking = false;

    /*
     * ==========================================
     * GET ACTIVE VIDEO
     * ==========================================
     */

    const getActiveVideo = () => {
      return window.innerWidth < 768
        ? mobileVideo
        : desktopVideo;
    };


    /*
     * ==========================================
     * TEXT ANIMATIONS
     * ==========================================
     */

    const updateTextAnimations = (progress) => {
      const burgerText =
        document.getElementById('burger-text');

      const pizzaText =
        document.getElementById('pizza-text');

      if (!burgerText || !pizzaText) return;


      /*
       * ========================================
       * BURGER TEXT
       *
       * ENTER: 20%
       * FULLY VISIBLE: 25%
       * VANISH: 30%
       * ========================================
       */

      let burgerOpacity = 0;
      let burgerX = -100;

      if (progress < 0.20) {

        // Before 20%
        burgerOpacity = 0;
        burgerX = -100;

      } else if (progress < 0.25) {

        // 20% → 25%
        // Slide in from left

        const enterProgress =
          (progress - 0.20) / 0.05;

        const eased =
          1 - Math.pow(
            1 - enterProgress,
            3
          );

        burgerX =
          -100 + eased * 108;

        burgerOpacity = eased;

      } else if (progress < 0.30) {

        // 25% → 30%
        // Slide/fade out to left

        const exitProgress =
          (progress - 0.25) / 0.05;

        const eased =
          Math.pow(
            exitProgress,
            3
          );

        burgerX =
          8 - eased * 108;

        burgerOpacity =
          1 - eased;

      } else {

        // After 30%
        burgerOpacity = 0;
        burgerX = -100;
      }

      burgerText.style.opacity =
        burgerOpacity;

      burgerText.style.transform =
        `translateX(${burgerX}%) translateY(-50%)`;


      /*
       * ========================================
       * PIZZA TEXT
       *
       * ENTER: 35%
       * FULLY VISIBLE: 42.5%
       * VANISH: 50%
       * ========================================
       */

      let pizzaOpacity = 0;
      let pizzaX = 100;

      if (progress < 0.35) {

        // Before 35%
        pizzaOpacity = 0;
        pizzaX = 100;

      } else if (progress < 0.425) {

        // 35% → 42.5%
        // Slide in from right

        const enterProgress =
          (progress - 0.35) / 0.075;

        const eased =
          1 - Math.pow(
            1 - enterProgress,
            3
          );

        pizzaX =
          100 - eased * 108;

        pizzaOpacity = eased;

      } else if (progress < 0.50) {

        // 42.5% → 50%
        // Slide/fade out to right

        const exitProgress =
          (progress - 0.425) / 0.075;

        const eased =
          Math.pow(
            exitProgress,
            3
          );

        pizzaX =
          -8 + eased * 108;

        pizzaOpacity =
          1 - eased;

      } else {

        // After 50%
        pizzaOpacity = 0;
        pizzaX = 100;
      }

      pizzaText.style.opacity =
        pizzaOpacity;

      pizzaText.style.transform =
        `translateX(${pizzaX}%) translateY(-50%)`;
    };


    /*
     * ==========================================
     * SETUP
     * ==========================================
     */

    const setup = () => {
      const video = getActiveVideo();

      if (
        !video.duration ||
        !isFinite(video.duration)
      ) {
        return;
      }

      desktopVideo.pause();
      mobileVideo.pause();

      /*
       * Total scroll distance required
       * to scrub through the entire video.
       */

      animationHeight =
        video.duration *
        PIXELS_PER_SECOND;

      /*
       * Hero height.
       */

      hero.style.height =
        `${animationHeight + window.innerHeight}px`;

      update();
    };


    /*
     * ==========================================
     * MAIN UPDATE
     * ==========================================
     */

    const update = () => {
      ticking = false;

      const video = getActiveVideo();

      if (
        !video.duration ||
        !isFinite(video.duration) ||
        animationHeight <= 0
      ) {
        return;
      }

      const scrollY =
        window.scrollY;


      /*
       * ========================================
       * VIDEO PROGRESS
       * ========================================
       */

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            scrollY / animationHeight
          )
        );


      /*
       * ========================================
       * VIDEO CURRENT TIME
       * ========================================
       */

      const targetTime =
        progress * video.duration;

      if (
        Math.abs(
          video.currentTime -
          targetTime
        ) > 0.005
      ) {
        video.currentTime =
          targetTime;
      }


      /*
       * ========================================
       * VIDEO POSITION
       * ========================================
       */

      if (
        scrollY < animationHeight
      ) {

        /*
         * Keep videos locked
         * to viewport.
         */

        desktopVideo.style.position =
          'fixed';

        desktopVideo.style.top =
          '0';

        desktopVideo.style.left =
          '0';


        mobileVideo.style.position =
          'fixed';

        mobileVideo.style.top =
          '0';

        mobileVideo.style.left =
          '0';

      } else {

        /*
         * Release video after
         * animation completes.
         */

        desktopVideo.style.position =
          'absolute';

        desktopVideo.style.top =
          `${animationHeight}px`;

        desktopVideo.style.left =
          '0';


        mobileVideo.style.position =
          'absolute';

        mobileVideo.style.top =
          `${animationHeight}px`;

        mobileVideo.style.left =
          '0';
      }


      /*
       * ========================================
       * UPDATE TEXT ANIMATIONS
       * ========================================
       */

      updateTextAnimations(
        progress
      );
    };


    /*
     * ==========================================
     * SCROLL HANDLER
     * ==========================================
     */

    const handleScroll = () => {
      if (!ticking) {

        window.requestAnimationFrame(
          update
        );

        ticking = true;
      }
    };


    /*
     * ==========================================
     * VIDEO METADATA
     * ==========================================
     */

    if (
      desktopVideo.readyState >= 1
    ) {
      setup();
    } else {
      desktopVideo.addEventListener(
        'loadedmetadata',
        setup
      );
    }


    if (
      mobileVideo.readyState >= 1
    ) {
      setup();
    } else {
      mobileVideo.addEventListener(
        'loadedmetadata',
        setup
      );
    }


    /*
     * ==========================================
     * EVENT LISTENERS
     * ==========================================
     */

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      setup
    );


    /*
     * ==========================================
     * CLEANUP
     * ==========================================
     */

    return () => {

      desktopVideo.removeEventListener(
        'loadedmetadata',
        setup
      );

      mobileVideo.removeEventListener(
        'loadedmetadata',
        setup
      );

      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        setup
      );
    };

  }, []);


  /*
   * ==========================================
   * NAVIGATION
   * ==========================================
   */

  const scrollTo = (id) => {

    const element =
      document.getElementById(id);

    if (element) {

      setMenuOpen(false);

      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };


  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <main>

      {/* ======================================
          HEADER
          ====================================== */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          z-50
          px-5
          py-4
          text-white
        "
      >

        <nav
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
          "
        >

          {/* LOGO */}

          <h1
            className="
              text-xl
              font-bold
              sm:text-2xl
            "
          >
            The Italian Bistro
          </h1>


          {/* DESKTOP NAVIGATION */}

          <ul
            className="
              hidden
              items-center
              space-x-6
              md:flex
            "
          >

            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('about');
                }}
                className="hover:underline"
              >
                About Us
              </a>
            </li>

            <li>
              <a
                href="#what-we-serve"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('what-we-serve');
                }}
                className="hover:underline"
              >
                What We Serve
              </a>
            </li>

            <li>
              <a
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('reviews');
                }}
                className="hover:underline"
              >
                Reviews
              </a>
            </li>

            <li>
              <a
                href="#location"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('location');
                }}
                className="hover:underline"
              >
                Location
              </a>
            </li>

          </ul>


          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-black/20
              text-2xl
              md:hidden
            "
            aria-label="Toggle menu"
          >
            ☰
          </button>

        </nav>


        {/* ==================================
            MOBILE MENU
            ================================== */}

        {menuOpen && (

          <div
            className="
              absolute
              left-0
              right-0
              top-full
              bg-black/90
              px-6
              py-6
              backdrop-blur-md
              md:hidden
            "
          >

            <div
              className="
                flex
                flex-col
                gap-5
                text-lg
              "
            >

              <button
                onClick={() =>
                  scrollTo('about')
                }
                className="text-left"
              >
                About Us
              </button>

              <button
                onClick={() =>
                  scrollTo('what-we-serve')
                }
                className="text-left"
              >
                What We Serve
              </button>

              <button
                onClick={() =>
                  scrollTo('reviews')
                }
                className="text-left"
              >
                Reviews
              </button>

              <button
                onClick={() =>
                  scrollTo('location')
                }
                className="text-left"
              >
                Location
              </button>

            </div>

          </div>

        )}

      </header>


      {/* ======================================
          VIDEO SCROLL HERO
          ====================================== */}

      <section
        ref={heroRef}
        className="
          relative
          w-full
        "
      >

        {/* DESKTOP VIDEO */}

        <video
          ref={desktopVideoRef}
          src="/main.mp4"
          muted
          playsInline
          preload="auto"
          className="
            hidden
            h-screen
            w-full
            object-cover
            md:block
          "
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />


        {/* MOBILE VIDEO */}

        <video
          ref={mobileVideoRef}
          src="/main-mobile.mp4"
          muted
          playsInline
          preload="auto"
          className="
            block
            h-[100dvh]
            w-full
            object-cover
            md:hidden
          "
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />


        {/* ==================================
            BURGER TEXT
            20% ENTER
            25% FULL
            30% EXIT
            ================================== */}

        <div
          id="burger-text"
          className="
            pointer-events-none
            fixed
            left-0
            top-1/2
            z-20
            w-[42%]
            -translate-y-1/2
            text-left
            text-white
            md:w-[35%]
          "
          style={{
            opacity: 0,
            transform:
              'translateX(-100%) translateY(-50%)',
          }}
        >

          <div
            className="
              px-6
              md:px-12
            "
          >

            <h2
              className="
                text-3xl
                font-semibold
                leading-tight
                md:text-5xl
              "
            >
              Mouthwatering
              <br />
              Burgers
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                md:text-lg
              "
            >
              Perfectly grilled.
              <br />
              Served with an ice-cold Coke.
            </p>

          </div>

        </div>


        {/* ==================================
            PIZZA TEXT
            35% ENTER
            42.5% FULL
            50% EXIT
            ================================== */}

        <div
          id="pizza-text"
          className="
            pointer-events-none
            fixed
            right-0
            top-1/2
            z-20
            w-[42%]
            -translate-y-1/2
            text-right
            text-white
            md:w-[35%]
          "
          style={{
            opacity: 0,
            transform:
              'translateX(100%) translateY(-50%)',
          }}
        >

          <div
            className="
              px-6
              md:px-12
            "
          >

            <h2
              className="
                text-3xl
                font-semibold
                leading-tight
                md:text-5xl
              "
            >
              Italian Pizza
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                md:text-lg
              "
            >
              Authentic flavors.
              <br />
              Paired with fresh cold coffee.
            </p>

          </div>

        </div>


        {/* ==================================
            SUBTLE DARK OVERLAY
            ================================== */}

        <div
          className="
            pointer-events-none
            fixed
            inset-0
          "
          style={{
            zIndex: 15,
            background:
              'rgba(0, 0, 0, 0.15)',
          }}
        />

      </section>


      {/* ======================================
          ABOUT
          ====================================== */}

      <section
        id="about"
        className="
          relative
          z-30
          flex
          min-h-screen
          items-center
          justify-center
          bg-white
        "
      >
        <h2
          className="
            text-5xl
            font-bold
          "
        >
          About Us
        </h2>
      </section>


      {/* ======================================
          WHAT WE SERVE
          ====================================== */}

      <section
        id="what-we-serve"
        className="
          relative
          z-30
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-100
        "
      >
        <h2
          className="
            text-5xl
            font-bold
          "
        >
          What We Serve
        </h2>
      </section>


      {/* ======================================
          REVIEWS
          ====================================== */}

      <section
        id="reviews"
        className="
          relative
          z-30
          flex
          min-h-screen
          items-center
          justify-center
          bg-white
        "
      >
        <h2
          className="
            text-5xl
            font-bold
          "
        >
          Reviews
        </h2>
      </section>


      {/* ======================================
          LOCATION
          ====================================== */}

      <section
        id="location"
        className="
          relative
          z-30
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-100
        "
      >
        <h2
          className="
            text-5xl
            font-bold
          "
        >
          Location
        </h2>
      </section>


      {/* ======================================
          FOOTER
          ====================================== */}

      <footer
        className="
          relative
          z-30
          bg-gray-900
          py-20
          text-center
          text-white
        "
      >
        © 2026 Your Company
      </footer>

    </main>
  );
}