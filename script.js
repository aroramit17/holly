const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animatedItems = document.querySelectorAll("[data-animate]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const root = document.documentElement;
const poster = document.querySelector(".poster");

if (motionAllowed) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  animatedItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 80, 360)}ms`;
    observer.observe(item);
  });

  let latestScroll = window.scrollY;
  let pointerX = 0;
  let pointerY = 0;
  let ticking = false;

  const updateMotion = () => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(latestScroll / maxScroll, 1);
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    root.style.setProperty("--pointer-x", pointerX.toFixed(4));
    root.style.setProperty("--pointer-y", pointerY.toFixed(4));

    parallaxItems.forEach((item) => {
      const depth = Number.parseFloat(item.dataset.parallax || "0");
      const scrollShift = latestScroll * depth;
      const pointerShiftX = pointerX * depth * 26;
      const pointerShiftY = pointerY * depth * 18;
      item.style.translate = `${pointerShiftX.toFixed(2)}px ${(scrollShift + pointerShiftY).toFixed(2)}px`;
    });

    ticking = false;
  };

  const requestMotionUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateMotion);
      ticking = true;
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      latestScroll = window.scrollY;
      requestMotionUpdate();
    },
    { passive: true },
  );

  if (poster) {
    poster.addEventListener(
      "pointermove",
      (event) => {
        const rect = poster.getBoundingClientRect();
        pointerX = (event.clientX - rect.left) / rect.width - 0.5;
        pointerY = (event.clientY - rect.top) / rect.height - 0.5;
        requestMotionUpdate();
      },
      { passive: true },
    );

    poster.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      requestMotionUpdate();
    });
  }

  updateMotion();
} else {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
}
