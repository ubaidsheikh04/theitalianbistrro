'use client';

import { useEffect, useRef } from 'react';


// ============================================================
// HEADER
// ============================================================

const Header = () => {
  const headerRef = useRef(null);

  const scrollTo = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[50] text-white"
      style={{
        backgroundColor: 'rgba(35, 50, 43, 0)',
        transition: 'background-color 0.15s linear',
      }}
    >
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-5">

        {/* Logo */}
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
          className="text-2xl md:text-3xl font-bold whitespace-nowrap"
        >
          The Italian Bistrro
        </button>


        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8 text-lg font-semibold">

          <li>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('about');
              }}
              className="hover:opacity-70 transition-opacity"
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
              className="hover:opacity-70 transition-opacity"
            >
              What We Serve
            </a>
          </li>

          <li>
            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('menu');
              }}
              className="hover:opacity-70 transition-opacity"
            >
              Menu
            </a>
          </li>

          <li>
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('reviews');
              }}
              className="hover:opacity-70 transition-opacity"
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
              className="hover:opacity-70 transition-opacity"
            >
              Location
            </a>
          </li>

        </ul>


        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">

          <button
            onClick={() => scrollTo('menu')}
            className="text-sm font-semibold border border-white/50 px-4 py-2 rounded-full"
          >
            Menu
          </button>

        </div>

      </nav>
    </header>
  );
};


// ============================================================
// MAIN PAGE
// ============================================================

export default function Page() {

  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const headerRef = useRef(null);

  const burgerTextRef = useRef(null);
  const pizzaTextRef = useRef(null);
  const cafeTextRef = useRef(null);


  useEffect(() => {

    const video = videoRef.current;
    const hero = heroRef.current;

    if (!video || !hero) return;


    // ========================================================
    // CONFIGURATION
    // ========================================================

    const PIXELS_PER_SECOND = 1000;

    let animationHeight = 0;
    let ticking = false;


    // ========================================================
    // HEADER
    // ========================================================

    const updateHeader = (progress) => {

      /*
       * Header behavior:
       *
       * 0% - 75%
       * Completely transparent.
       *
       * 75% - 100%
       * Slowly becomes opaque.
       *
       * 100%
       * Completely solid.
       */

      const FADE_START = 0.75;

      let opacity = 0;

      if (progress > FADE_START) {

        opacity =
          (progress - FADE_START) /
          (1 - FADE_START);

      }

      opacity = Math.max(
        0,
        Math.min(1, opacity)
      );


      /*
       * Olive green header.
       */

      const background =
        `rgba(35, 50, 43, ${opacity})`;


      /*
       * Find header directly.
       */

      const header =
        document.querySelector('header');


      if (header) {

        header.style.backgroundColor =
          background;


        /*
         * Add a subtle shadow only
         * once the header becomes visible.
         */

        if (opacity > 0.05) {

          header.style.boxShadow =
            `0 4px 20px rgba(0,0,0,${opacity * 0.18})`;

        } else {

          header.style.boxShadow =
            'none';

        }

      }

    };


    // ========================================================
    // TEXT ANIMATION HELPER
    // ========================================================

    const updateTextAnimation = (
      element,
      progress,
      enter,
      visible,
      exit,
      direction
    ) => {

      if (!element) return;


      let opacity = 0;
      let translateX = 0;


      // ------------------------------------------------------
      // BEFORE ENTER
      // ------------------------------------------------------

      if (progress < enter) {

        opacity = 0;

        translateX =
          direction === 'left'
            ? -120
            : 120;

      }


      // ------------------------------------------------------
      // ENTER → FULLY VISIBLE
      // ------------------------------------------------------

      else if (
        progress >= enter &&
        progress < visible
      ) {

        const localProgress =
          (progress - enter) /
          (visible - enter);

        opacity = localProgress;

        const distance =
          120 * (1 - localProgress);

        translateX =
          direction === 'left'
            ? -distance
            : distance;

      }


      // ------------------------------------------------------
      // FULLY VISIBLE
      // ------------------------------------------------------

      else if (
        progress >= visible &&
        progress < exit
      ) {

        opacity = 1;
        translateX = 0;

      }


      // ------------------------------------------------------
      // EXIT
      // ------------------------------------------------------

      else {

        const localProgress =
          Math.min(
            1,
            (progress - exit) /
            0.10
          );

        opacity =
          1 - localProgress;

        const distance =
          120 * localProgress;

        translateX =
          direction === 'left'
            ? -distance
            : distance;

      }


      element.style.opacity =
        opacity;

      element.style.transform =
        `translateX(${translateX}px)`;

    };


    // ========================================================
    // MAIN SCROLL UPDATE
    // ========================================================

    const update = () => {

      ticking = false;


      if (
        !video.duration ||
        !isFinite(video.duration) ||
        animationHeight <= 0
      ) {

        return;

      }


      // ------------------------------------------------------
      // SCROLL POSITION
      // ------------------------------------------------------

      const scrollY =
        window.scrollY;


      // ------------------------------------------------------
      // VIDEO PROGRESS
      // ------------------------------------------------------

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            scrollY / animationHeight
          )
        );


      // ------------------------------------------------------
      // VIDEO TIME
      // ------------------------------------------------------

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


      // ======================================================
      // HEADER TRANSPARENCY
      // ======================================================

      updateHeader(progress);


      // ======================================================
      // BURGER TEXT
      //
      // 20% → enters
      // 30% → fully visible
      // 40% → disappears
      // ======================================================

      updateTextAnimation(
        burgerTextRef.current,
        progress,
        0.20,
        0.30,
        0.40,
        'left'
      );


      // ======================================================
      // PIZZA TEXT
      //
      // 50% → enters
      // 60% → fully visible
      // 80% → disappears
      // ======================================================

      updateTextAnimation(
        pizzaTextRef.current,
        progress,
        0.50,
        0.60,
        0.80,
        'right'
      );


      // ======================================================
      // CAFE HIGHLIGHT
      //
      // 80% → enters
      // 90% → fully visible
      // 100% → remains visible
      // ======================================================

      const cafe =
        cafeTextRef.current;


      if (cafe) {

        if (progress < 0.80) {

          cafe.style.opacity = 0;

          cafe.style.transform =
            'translateY(60px) scale(0.95)';

        }

        else if (progress < 0.90) {

          const localProgress =
            (progress - 0.80) /
            0.10;

          cafe.style.opacity =
            localProgress;

          cafe.style.transform =
            `translateY(${60 - (60 * localProgress)}px) scale(${0.95 + (0.05 * localProgress)})`;

        }

        else {

          cafe.style.opacity = 1;

          cafe.style.transform =
            'translateY(0) scale(1)';

        }

      }


      // ======================================================
      // VIDEO POSITION
      // ======================================================

      if (scrollY < animationHeight) {

        /*
         * Keep video fixed to viewport
         * while the user scrubs through it.
         */

        video.style.position =
          'fixed';

        video.style.top = '0';
        video.style.left = '0';

      }

      else {

        /*
         * Once video is completely finished,
         * release it so the normal website
         * can continue scrolling.
         */

        video.style.position =
          'absolute';

        video.style.top =
          `${animationHeight}px`;

        video.style.left = '0';

      }

    };


    // ========================================================
    // SETUP
    // ========================================================

    const setup = () => {

      if (
        !video.duration ||
        !isFinite(video.duration)
      ) {

        return;

      }


      /*
       * Pause because the video is controlled
       * entirely by scrolling.
       */

      video.pause();


      /*
       * Calculate scroll distance required
       * to scrub through the complete video.
       */

      animationHeight =
        video.duration *
        PIXELS_PER_SECOND;


      /*
       * Hero must be tall enough to provide
       * physical scrolling distance.
       */

      hero.style.height =
        `${animationHeight + window.innerHeight}px`;


      update();

    };


    // ========================================================
    // SCROLL HANDLER
    // ========================================================

    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(
          update
        );

        ticking = true;

      }

    };


    // ========================================================
    // VIDEO READY
    // ========================================================

    if (video.readyState >= 1) {

      setup();

    }

    else {

      video.addEventListener(
        'loadedmetadata',
        setup
      );

    }


    // ========================================================
    // EVENT LISTENERS
    // ========================================================

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      setup
    );


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {

      video.removeEventListener(
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


  return (

    <main className="bg-[#0b1f18] text-[#eee7d5]">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <Header />


      {/* =====================================================
          HERO VIDEO
          ===================================================== */}

      <section
        ref={heroRef}
        className="relative w-full"
      >

        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="block h-screen w-full object-cover"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        >

          {/* Desktop */}
          <source
            src="/main.mp4"
            media="(min-width: 768px)"
            type="video/mp4"
          />

          {/* Mobile */}
          <source
            src="/main-mobile.mp4"
            media="(max-width: 767px)"
            type="video/mp4"
          />

        </video>


        {/* =================================================
            DARK VIDEO OVERLAY
            ================================================= */}

        <div
          className="pointer-events-none fixed inset-0"
          style={{
            zIndex: 11,
            background:
              'rgba(0, 0, 0, 0)',
          }}
        />


        {/* =================================================
            BURGER TEXT
            20% → 30% → 40%
            ================================================= */}

        <div
          ref={burgerTextRef}

          /*
           * ONLY CHANGE:
           * Mobile position moved slightly upward.
           * Desktop remains at top-1/2.
           */
          className="pointer-events-none fixed z-[20] left-[6%] top-[42%] md:top-1/2 -translate-y-1/2"

          style={{
            opacity: 0,
            transform:
              'translateX(-120px)',
          }}
        >

          <div className="max-w-md">

            <p className="text-sm md:text-lg uppercase tracking-[0.3em] text-[#f4b942] mb-3">
              Something Delicious
            </p>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Mouth-watering
              <br />
              Burger
            </h2>

            <p className="mt-4 text-lg md:text-2xl text-[#eee7d5]">
              Best enjoyed with an ice-cold Coke.
            </p>

          </div>

        </div>


        {/* =================================================
            PIZZA TEXT
            50% → 60% → 80%
            ================================================= */}

        <div
          ref={pizzaTextRef}
          className="pointer-events-none fixed z-[20] right-[6%] top-1/2 -translate-y-1/2 text-right"
          style={{
            opacity: 0,
            transform:
              'translateX(120px)',
          }}
        >

          <div className="max-w-md">

            <p className="text-sm md:text-lg uppercase tracking-[0.3em] text-[#f4b942] mb-3">
              Italian Favourites
            </p>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Fresh Italian
              <br />
              Pizza
            </h2>

            <p className="mt-4 text-lg md:text-2xl text-[#eee7d5]">
              Paired with a fresh cold coffee.
            </p>

          </div>

        </div>


        {/* =================================================
            CAFE HIGHLIGHT
            80% → 90% → 100%
            ================================================= */}

        <div
          ref={cafeTextRef}
          className="pointer-events-none fixed inset-0 z-[20] flex items-center justify-center px-6"
          style={{
            opacity: 0,
            transform:
              'translateY(60px) scale(0.95)',
          }}
        >

          <div className="text-center">

            <p className="text-sm md:text-xl uppercase tracking-[0.45em] text-[#f4b942] mb-4">
              Welcome To
            </p>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white">
              The Italian Bistrro
            </h1>

            <p className="mt-4 text-xl md:text-3xl italic text-[#eee7d5]">
              where hunger meets happiness
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ABOUT US
          ===================================================== */}

      <section
        id="about"
        className="relative z-20 min-h-screen bg-[#28372e] px-6 md:px-12 lg:px-20 py-24 flex items-center"
      >

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>

            <p className="text-[#f4b942] text-xl font-semibold mb-8">
              About Us
            </p>

            <h2 className="text-5xl md:text-7xl font-bold leading-tight text-[#eee7d5]">
              A Little Taste
              <br />
              of Italy
            </h2>

            <div className="mt-12 space-y-7 text-lg md:text-xl leading-relaxed text-[#e4d8c0]">

              <p>
                Welcome to The Italian Bistrro — a cozy cafe
                created for people who believe good food tastes
                even better when shared.
              </p>

              <p>
                From handcrafted pizzas and juicy burgers to
                comforting hot coffees, refreshing cold coffees
                and chilled beverages, every plate is prepared
                with care and served with a smile.
              </p>

              <p>
                Our kitchen brings together familiar favourites
                with an Italian-inspired touch, creating a place
                where great food, good coffee and happy moments
                come together.
              </p>

            </div>


            <div className="mt-12 border-l-4 border-[#f4b942] pl-6">

              <span className="block text-6xl font-bold text-[#f4b942]">
                10
              </span>

              <span className="text-xl text-[#eee7d5]">
                Years of
              </span>

              <strong className="block text-xl text-white">
                CHEF EXPERIENCE
              </strong>

            </div>

          </div>


          {/* About image */}

          <div
            /*
             * ONLY CHANGE:
             * Mobile = 1:1
             * Desktop = existing minimum height.
             */
            className="aspect-square lg:aspect-auto rounded-3xl overflow-hidden border border-[#49665a] lg:min-h-[500px]"
          >

            <img
              src="/about-cafe.jpg"
              alt="The Italian Bistrro cafe"
              className="w-full h-full object-cover"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          WHAT WE SERVE
          ===================================================== */}

      <section
        id="what-we-serve"
        className="relative z-20 bg-[#0b1f18] px-6 md:px-12 lg:px-20 py-28"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-[#f4b942] text-xl font-semibold mb-4">
              What We Serve
            </p>

            <h2 className="text-5xl md:text-6xl font-bold text-[#eee7d5]">
              Made For Your Cravings
            </h2>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


            {/* Pizza */}

            <div className="rounded-2xl overflow-hidden border border-[#315348] bg-[#102820]">

              <img
                src="/pizza.jpg"
                alt="Fresh Italian Pizza"
                className="w-full h-60 object-cover"
              />

              <div className="p-7">

                <h3 className="text-3xl font-bold text-[#eee7d5]">
                  Fresh Pizzas
                </h3>

                <p className="mt-4 text-lg leading-relaxed text-[#d7cdb9]">
                  Handcrafted pizzas loaded with delicious
                  toppings and baked fresh to order.
                </p>

              </div>

            </div>


            {/* Burgers */}

            <div className="rounded-2xl overflow-hidden border border-[#315348] bg-[#102820]">

              <img
                src="/burger.jpg"
                alt="Juicy Burger"
                className="w-full h-60 object-cover"
              />

              <div className="p-7">

                <h3 className="text-3xl font-bold text-[#eee7d5]">
                  Juicy Burgers
                </h3>

                <p className="mt-4 text-lg leading-relaxed text-[#d7cdb9]">
                  Delicious burgers stacked with fresh ingredients
                  and served hot.
                </p>

              </div>

            </div>


            {/* Coffee */}

            <div className="rounded-2xl overflow-hidden border border-[#315348] bg-[#102820]">

              <img
                src="/coffee.jpg"
                alt="Hot and Cold Coffee"
                className="w-full h-60 object-cover"
              />

              <div className="p-7">

                <h3 className="text-3xl font-bold text-[#eee7d5]">
                  Hot & Cold Coffee
                </h3>

                <p className="mt-4 text-lg leading-relaxed text-[#d7cdb9]">
                  From rich hot espresso creations to refreshing
                  chilled coffees.
                </p>

              </div>

            </div>


            {/* Beverages */}

            <div className="rounded-2xl overflow-hidden border border-[#315348] bg-[#102820]">

              <img
                src="/beverages.jpg"
                alt="Cold Beverages and Mojitos"
                className="w-full h-60 object-cover"
              />

              <div className="p-7">

                <h3 className="text-3xl font-bold text-[#eee7d5]">
                  Cool Beverages
                </h3>

                <p className="mt-4 text-lg leading-relaxed text-[#d7cdb9]">
                  Chilled Coke, refreshing mojitos and refreshing
                  drinks for every mood.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MENU
          ===================================================== */}

      <section
        id="menu"
        className="relative z-20 bg-[#102820] px-6 md:px-12 lg:px-20 py-28"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-[#f4b942] text-xl font-semibold">
              Food & Drinks
            </p>

            <h2 className="text-5xl md:text-6xl font-bold mt-4 text-[#eee7d5]">
              Our Menu
            </h2>

            <p className="mt-5 text-lg text-[#d7cdb9]">
              Simple favourites. Freshly prepared. Made to satisfy.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


            {/* Pizzas */}

            <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-8">

              <h3 className="text-3xl font-bold text-[#f4b942] mb-6">
                🍕 Pizzas
              </h3>

              <div className="space-y-5 text-[#eee7d5]">

                <div className="flex justify-between gap-4">
                  <span>Margherita</span>
                  <span>€ 9.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Farmhouse</span>
                  <span>€ 11.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Veggie Delight</span>
                  <span>€ 12.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Italian Special</span>
                  <span>€ 13.90</span>
                </div>

              </div>

            </div>


            {/* Burgers */}

            <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-8">

              <h3 className="text-3xl font-bold text-[#f4b942] mb-6">
                🍔 Burgers
              </h3>

              <div className="space-y-5 text-[#eee7d5]">

                <div className="flex justify-between gap-4">
                  <span>Classic Burger</span>
                  <span>€ 9.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Cheese Burger</span>
                  <span>€ 10.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Italian Burger</span>
                  <span>€ 12.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Double Cheese</span>
                  <span>€ 13.90</span>
                </div>

              </div>

            </div>


            {/* Coffee */}

            <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-8">

              <h3 className="text-3xl font-bold text-[#f4b942] mb-6">
                ☕ Coffee
              </h3>

              <div className="space-y-5 text-[#eee7d5]">

                <div className="flex justify-between gap-4">
                  <span>Espresso</span>
                  <span>€ 2.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Cappuccino</span>
                  <span>€ 3.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Latte</span>
                  <span>€ 4.00</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Iced Coffee</span>
                  <span>€ 4.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Cold Coffee</span>
                  <span>€ 4.90</span>
                </div>

              </div>

            </div>


            {/* Beverages */}

            <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-8">

              <h3 className="text-3xl font-bold text-[#f4b942] mb-6">
                🥤 Beverages
              </h3>

              <div className="space-y-5 text-[#eee7d5]">

                <div className="flex justify-between gap-4">
                  <span>Coke</span>
                  <span>€ 2.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Virgin Mojito</span>
                  <span>€ 4.90</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Mint Mojito</span>
                  <span>€ 5.50</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Lemon Mojito</span>
                  <span>€ 5.50</span>
                </div>

              </div>

            </div>


            {/* Combos */}

            <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-8 md:col-span-2">

              <h3 className="text-3xl font-bold text-[#f4b942] mb-6">
                ⭐ Bistrro Combos
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-[#eee7d5]">

                <div>

                  <h4 className="text-xl font-semibold">
                    Burger Combo
                  </h4>

                  <p className="text-[#d7cdb9] mt-2">
                    Burger + Fries + Coke
                  </p>

                  <p className="text-[#f4b942] mt-2 font-bold">
                    € 13.90
                  </p>

                </div>


                <div>

                  <h4 className="text-xl font-semibold">
                    Pizza Combo
                  </h4>

                  <p className="text-[#d7cdb9] mt-2">
                    Pizza + Coke
                  </p>

                  <p className="text-[#f4b942] mt-2 font-bold">
                    € 14.90
                  </p>

                </div>


                <div>

                  <h4 className="text-xl font-semibold">
                    Coffee Combo
                  </h4>

                  <p className="text-[#d7cdb9] mt-2">
                    Cake + Cold Coffee
                  </p>

                  <p className="text-[#f4b942] mt-2 font-bold">
                    € 8.90
                  </p>

                </div>


                <div>

                  <h4 className="text-xl font-semibold">
                    Bistrro Duo
                  </h4>

                  <p className="text-[#d7cdb9] mt-2">
                    2 Burgers + 2 Coke
                  </p>

                  <p className="text-[#f4b942] mt-2 font-bold">
                    € 24.90
                  </p>

                </div>

              </div>

            </div>

          </div>


          <div className="text-center mt-12">

            <p className="text-[#d7cdb9] text-lg">
              Ask our team about today's specials.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          REVIEWS
          ===================================================== */}

      <section
        id="reviews"
        className="relative z-20 bg-[#0b1f18] px-6 md:px-12 lg:px-20 py-28"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-[#f4b942] text-xl font-semibold">
              Guest Love
            </p>

            <h2 className="text-5xl md:text-6xl font-bold mt-4 text-[#eee7d5]">
              What Our Guests Say
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">


            <div className="bg-[#102820] border border-[#315348] rounded-2xl p-8">

              <div className="text-[#f4b942] text-2xl">
                ★★★★★
              </div>

              <p className="mt-6 text-lg leading-relaxed text-[#d7cdb9]">
                “Amazing pizza, great coffee and such a cozy
                atmosphere. Definitely coming back!”
              </p>

              <p className="mt-6 font-bold text-[#eee7d5]">
                Happy Guest
              </p>

            </div>


            <div className="bg-[#102820] border border-[#315348] rounded-2xl p-8">

              <div className="text-[#f4b942] text-2xl">
                ★★★★★
              </div>

              <p className="mt-6 text-lg leading-relaxed text-[#d7cdb9]">
                “The burger was delicious and the cold coffee
                was exactly what I needed.”
              </p>

              <p className="mt-6 font-bold text-[#eee7d5]">
                Happy Guest
              </p>

            </div>


            <div className="bg-[#102820] border border-[#315348] rounded-2xl p-8">

              <div className="text-[#f4b942] text-2xl">
                ★★★★★
              </div>

              <p className="mt-6 text-lg leading-relaxed text-[#d7cdb9]">
                “Lovely place to sit, eat and spend time with
                friends. The whole experience feels welcoming.”
              </p>

              <p className="mt-6 font-bold text-[#eee7d5]">
                Happy Guest
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LOCATION
          ===================================================== */}

      <section
        id="location"
        className="relative z-20 bg-[#102820] px-6 md:px-12 lg:px-20 py-28"
      >

        <div className="max-w-5xl mx-auto text-center">

          <p className="text-[#f4b942] text-xl font-semibold">
            Come Visit Us
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-4 text-[#eee7d5]">
            Find Us Here
          </h2>


          <div className="mt-12 rounded-3xl overflow-hidden border border-[#315348] h-[400px]">

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.900610479134!2d74.3464247732858!3d16.225548535237802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc08f4cf06c0cc5%3A0xc7046bbd9ddbba67!2sThe%20Italian%20Bistrro!5e0!3m2!1sen!2sin!4v1787312024355!5m2!1sen!2sin"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

          </div>


          <div className="mt-10">

            <h3 className="text-3xl font-bold text-[#eee7d5]">
              We look forward to your visit!
            </h3>

            <p className="mt-5 text-lg text-[#d7cdb9]">
              Reservations can be made by phone call.
            </p>

            <a
              href="tel:+YOUR_PHONE_NUMBER"
              className="inline-block mt-6 bg-[#f4b942] text-[#102820] px-8 py-4 rounded-xl font-semibold hover:opacity-80 transition"
            >
              Call For Reservation
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer
        className="relative z-20 bg-[#0b1f18] text-[#d7cdb9] px-6 md:px-12 lg:px-20 pt-20 pb-8"
      >

        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">


            {/* Company */}

            <div>

              <h3 className="text-3xl font-bold text-[#f4b942]">
                The Italian Bistrro
              </h3>

              <p className="mt-5 leading-relaxed">
                Where hunger meets happiness.
                Good food, great coffee and
                unforgettable moments.
              </p>

            </div>


            {/* Contact */}

            <div>

              <h3 className="text-2xl font-bold text-[#f4b942]">
                Contact
              </h3>

              <div className="mt-5 space-y-3">

                <p>
                  The Italian Bistrro
                </p>

                <p>
                  Your Address
                </p>

                <p>
                  Your City
                </p>

                <p>
                  Your Country
                </p>

                <a
                  href="tel:+YOUR_PHONE_NUMBER"
                  className="block hover:text-[#f4b942]"
                >
                  Tel: +XX XXXXX XXXXX
                </a>

              </div>

            </div>


            {/* Opening Hours */}

            <div>

              <h3 className="text-2xl font-bold text-[#f4b942]">
                Opening Hours
              </h3>

              <div className="mt-5 space-y-4">

                <div>

                  <strong className="text-[#eee7d5]">
                    Tuesday – Saturday
                  </strong>

                  <p>
                    11:30 AM – 2:30 PM
                  </p>

                  <p>
                    6:00 PM – 10:00 PM
                  </p>

                </div>


                <div>

                  <strong className="text-[#eee7d5]">
                    Sunday
                  </strong>

                  <p>
                    11:30 AM – 2:30 PM
                  </p>

                  <p>
                    6:00 PM – 9:00 PM
                  </p>

                </div>


                <div>

                  <strong className="text-[#eee7d5]">
                    Monday
                  </strong>

                  <p>
                    Closed
                  </p>

                </div>

              </div>

            </div>


            {/* Reservation */}

            <div>

              <h3 className="text-2xl font-bold text-[#f4b942]">
                Reservations
              </h3>

              <p className="mt-5 leading-relaxed">
                Planning a dinner, celebration or
                simply craving your favourite pizza?
              </p>

              <p className="mt-4 leading-relaxed">
                Reservations can be made by phone call.
              </p>

              <a
                href="tel:+YOUR_PHONE_NUMBER"
                className="inline-block mt-6 bg-[#f4b942] text-[#102820] px-6 py-3 rounded-lg font-semibold"
              >
                Call Us
              </a>

            </div>

          </div>


          {/* Footer bottom */}

          <div className="border-t border-[#315348] mt-16 pt-8 flex flex-col md:flex-row justify-between gap-4">

            <p>
              © 2026 The Italian Bistrro. All Rights Reserved.
            </p>

            <p>
              Where hunger meets happiness.
            </p>

          </div>

        </div>

      </footer>


      {/* =====================================================
          BACK TO TOP
          ===================================================== */}

      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-xl bg-[#a77d20] text-[#102820] text-2xl font-bold shadow-lg hover:opacity-80 transition"
        aria-label="Back to top"
      >
        ↑
      </button>


    </main>

  );

}
