/*
if (document.querySelector("[container]")) {
  if (window.innerWidth > 991) {
    gsap.utils.toArray("[container]").forEach((el) => {
      gsap.fromTo(
        el,
        { paddingBottom: "20em" }, // Initial padding-bottom
        {
          paddingBottom: "0em", // Final padding-bottom
          ease: "power2.In",
          scrollTrigger: {
            trigger: el,
            start: "top bottom", // Starts when the top of [container] is at the bottom of the screen
            end: "bottom top", // Ends when the top reaches the top of the screen
            scrub: 1,
          },
        }
      );
    });
  }
}
  */

// Video Slider
if (document.querySelector(".c-testimonials_modal")) {
  const $modal = $(".c-testimonials_modal");
  const $video = $modal.find("iframe");
  $("body").append($modal);

  $(".c-testimonials_modal-x").on("click", function () {
    $modal.addClass("cc-closed");
    $video.attr("src", "");
  });

  $(".slider").on("click", ".slider_play", function () {
    $modal.removeClass("cc-closed");
    const id = $(this).attr("video-id");
    $video.attr("src", `//www.youtube.com/embed/${id}`);
  });

  let isMobile = window.innerWidth <= 991;

  gsap.registerPlugin(ScrollTrigger);

  // Reusable function for initializing custom pagination
  function initializeCustomPagination(swiperInstance, sliderClass, $sliderContext) {
    // Construct a pagination selector that's scoped to the current slider container
    const paginationSelector = `.pagination${sliderClass}`;
    const paginationItemClass = "pagination_item";

    // Use $sliderContext.find(...) to localize the pagination and swiper elements
    const $pagination = $sliderContext.find(paginationSelector);
    const $swiper = $sliderContext.find(sliderClass);
    const slideCount = $swiper.find(".swiper-slide").length;

    if (!$pagination.length || slideCount === 0) return;

    // Clone and append pagination items efficiently
    const $paginationItemTemplate = $pagination.find(`.${paginationItemClass}`).first().clone();
    $pagination.empty().append(new Array(slideCount).fill().map(() => $paginationItemTemplate.clone()));

    const $paginationItems = $pagination.find(`.${paginationItemClass}`);
    $paginationItems.eq(0).addClass("cc-active"); // Set initial active state

    // Handle pagination click events
    $pagination.on("click", `.${paginationItemClass}`, function () {
      const index = $(this).index();
      if ($(this).hasClass("cc-active")) return; // Prevent unnecessary clicks
      swiperInstance.slideToLoop(index);
    });

    // Update pagination on slide change
    swiperInstance.on("slideChange", function () {
      const activeIndex = swiperInstance.realIndex;
      const $currentActive = $paginationItems.filter(".cc-active");
      if ($currentActive.index() === activeIndex) return;

      $currentActive.removeClass("cc-active").addClass("cc-exit");
      $paginationItems.eq(activeIndex).addClass("cc-active");

      setTimeout(() => {
        $currentActive.removeClass("cc-exit");
      }, 1000);
    });
  }

  $(".slider").each(function () {
    const $thisSlider = $(this);
    const sliderClass = ".cc-center-slider"; // Assumes this is the child element's class
    const sliderSelector = ".swiper" + sliderClass; // e.g. ".swiper.cc-center-slider"

    // Find the container and its slides within the current slider
    const $sliderContainer = $thisSlider.find(".swiper-wrapper" + sliderClass);
    const slides = $sliderContainer.children();
    const totalSlides = slides.length;

    if (!isMobile && totalSlides < 4) {
      slides.each(function () {
        const $clone = $(this).clone();
        $sliderContainer.append($clone);
      });
    }

    // Initialize Swiper on the localized slider element
    const centerSlider = new Swiper($thisSlider.find(sliderSelector)[0], {
      effect: "coverflow",
      coverflowEffect: {
        rotate: 0,
        slideShadows: false,
      },

      simulateTouch: false,
      loop: true,
      spaceBetween: 32,
      navigation: {
        nextEl: $thisSlider.find("#arrow-right")[0],
        prevEl: $thisSlider.find("#arrow-left")[0],
      },
      speed: 750,
      pagination: {
        clickable: true,
        el: $thisSlider.find(".swiper-pagination" + sliderClass)[0],
      },
      breakpoints: {
        991: {
          slidesPerView: 3, // For screens above 991px
          centeredSlides: true,
        },
        0: {
          simulateTouch: true,
          slidesPerView: 1, // For screens below 991px
        },
      },
      on: {
        slideChange: function () {
          // Get all video elements inside the slides
          const videos = document.querySelectorAll(".swiper.cc-center-slider .swiper-slide video");

          // Pause all videos and reset their playback
          videos.forEach((video) => {
            video.pause();
            video.currentTime = 0;
          });

          // Get the active slide
          const activeSlide = this.slides[this.activeIndex];

          // Find video inside active slide and play it
          const activeVideo = activeSlide.querySelector("video");
          if (activeVideo) {
            activeVideo.play();
          }
        },
      },
    });

    setTimeout(function () {
      centerSlider.slideNext();
    }, 250);

    $thisSlider.on("click", ".swiper-slide-next", function () {
      centerSlider.slideNext();
    });

    $thisSlider.on("click", ".swiper-slide-prev", function () {
      centerSlider.slidePrev();
    });

    // Apply custom pagination using the current slider's context
    initializeCustomPagination(centerSlider, sliderClass, $thisSlider);
  });
}

// Revolover

if (document.querySelector(".revolver_gsap")) {
  // Global handler to suppress AbortError rejections.
  window.addEventListener("unhandledrejection", function (e) {
    if (e.reason && e.reason.name === "AbortError") {
      e.preventDefault();
    }
  });

  // Make sure GSAP and the Flip plugin are loaded beforehand.
  const container = document.querySelector(".revolver_gsap");
  const intervalTime = 2500;
  let timer; // Reference for the interval

  // Sort items based on the data-index attribute (assumed numeric)
  function getSortedItems() {
    return Array.from(container.children).sort((a, b) => parseInt(a.dataset.index, 10) - parseInt(b.dataset.index, 10));
  }

  // Update the classes of each item based on the current center index.
  function updateItems() {
    const sortedItems = getSortedItems();
    const total = sortedItems.length;

    // Capture current state for FLIP animation.
    const state = Flip.getState(".revolver-wrap");

    sortedItems.forEach((item, i) => {
      let diff = i - currentCenterIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      if (diff === 0) {
        item.className = "revolver-wrap cc-center";
      } else if (diff === 1) {
        item.className = "revolver-wrap cc-next-1";
      } else if (diff === 2) {
        item.className = "revolver-wrap cc-next-2";
      } else if (diff === -1) {
        item.className = "revolver-wrap cc-prev-1";
      } else if (diff === -2) {
        item.className = "revolver-wrap cc-prev-2";
      } else if (diff > 2) {
        item.className = "revolver-wrap cc-next-3";
      } else if (diff < -2) {
        item.className = "revolver-wrap cc-prev-3";
      }
    });

    // Only animate if the document is visible.
    if (!document.hidden) {
      const anim = Flip.from(state, {
        duration: 0.75,
        ease: "power2.inOut",
      });
      if (anim && typeof anim.catch === "function") {
        anim.catch((err) => {
          if (err.name === "AbortError") return;
          console.error(err);
        });
      }
    }
  }

  // Determine the initial center index: look for an item with "cc-center", default to 0.
  let currentCenterIndex = getSortedItems().findIndex((item) => item.classList.contains("cc-center"));
  if (currentCenterIndex < 0) currentCenterIndex = 0;

  // Function to cycle the center pointer in forward direction.
  function cycleItems() {
    const sortedItems = getSortedItems();
    currentCenterIndex = (currentCenterIndex + 1) % sortedItems.length;
    updateItems();
  }

  // Timer control functions.
  function startTimer() {
    if (!timer) {
      timer = setInterval(cycleItems, intervalTime);
    }
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Start the timer.
  startTimer();

  // Pause/resume the timer based on tab visibility.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopTimer();
    } else {
      startTimer();
    }
  });
}

// for the joy of work

if (window.innerWidth > 991) {
  // Create a timeline that plays when scrolled into view
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".joy_words",
      start: "top 70%", // Starts animation when element is 80% from top of viewport
      toggleActions: "play none none none", // Play animation once when scrolled into view
    },
  });

  // Animate each element in sequence
  tl.fromTo("[for]", { y: "300%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut" })
    .fromTo("[the]", { y: "300%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, "-=0.95")
    .fromTo("[joy]", { y: "300%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, "-=0.95")
    .fromTo("[of]", { y: "300%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, "-=0.95")
    .fromTo("[work]", { y: "300%", opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, "-=0.95");

  // Create a timeline for the joy image movement
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".joy-of-work",
        start: "top center",
        end: "bottom top",
        scrub: 1.5,
      },
    })
    .fromTo(".joy_img", { y: "0em" }, { y: "-18em", ease: "none" })
    .fromTo(".joy-of-work", { y: "0%" }, { y: "0em", ease: "none" }, 0);
}

setTimeout(function () {
  scrollTrigger.refresh();
}, 1000);
