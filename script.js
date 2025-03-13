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
    autoplay: {
      delay: 5000,
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
