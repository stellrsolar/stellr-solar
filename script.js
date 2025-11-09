const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nav = $("#siteNav");
  const toggle = $("#navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#navMenu a").forEach(a =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const modal = $("#quoteModal");
  if (modal) {
    $$("[data-open-modal]").forEach(btn =>
      btn.addEventListener("click", () => modal.showModal())
    );
    modal.addEventListener("click", (e) => {
      const rect = $(".modal-content", modal).getBoundingClientRect();
      const inside = (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom);
      if (!inside) modal.close("close");
    });
    const closeBtn = $(".close", modal);
    if (closeBtn) closeBtn.addEventListener("click", () => modal.close("close"));
  }

  const heroVid = $("#heroVid");
  if (heroVid) {
    heroVid.addEventListener("loadeddata", () => {
      const ov = document.querySelector(".media-overlay");
      if (ov) ov.style.display = "none";
    });
  }

  const form = $("#quoteForm");
  if (form && modal) {
    const status = $("#formStatus");
    const submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        if (status) {
          status.textContent = "Please fill the required fields correctly.";
          status.style.color = "#ff6b6b";
        }
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      if (status) {
        status.textContent = "Sending…";
        status.style.color = "var(--muted)";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      try {
        const res = await fetch("/api/send-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.msg || "Email failed");
        if (status) {
          status.textContent = "Thanks! We’ll reach out shortly.";
          status.style.color = "var(--accent)";
        }
        setTimeout(() => modal.close("close"), 3000);
        form.reset();
      } catch (err) {
        if (status) {
          status.textContent = "Could not send. Please try again.";
          status.style.color = "#ff6b6b";
        }
        console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send";
        }
      }
    });
  }

  if (window.gsap) {
    gsap.from(".hero-content h1", { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" });
    gsap.from(".hero-content p", { y: 20, opacity: 0, duration: 0.6, delay: 0.1 });
    gsap.from(".hero-cta", { y: 16, opacity: 0, duration: 0.6, delay: 0.2 });
    gsap.utils.toArray(".wrap").forEach((sec) => {
      const title = sec.querySelector(".section-title");
      if (title) gsap.from(title, { scrollTrigger: { trigger: sec, start: "top 80%" }, y: 20, opacity: 0, duration: 0.5 });
      const elems = sec.querySelectorAll(".card, .steps li, .gallery img, .split > *");
      if (elems.length) gsap.from(elems, { scrollTrigger: { trigger: sec, start: "top 75%" }, y: 18, opacity: 0, duration: 0.5, stagger: 0.05 });
    });
  }

  const KEY = "logoAnimDone_v1";
  if (!localStorage.getItem(KEY) && window.gsap) {
    gsap.set(".logo", { transformOrigin: "50% 50%" });
    gsap.from(".logo", { scale: 0.2, rotation: -20, opacity: 0, duration: 0.9, ease: "back.out(1.7)" });
    gsap.from(".brand-text", { y: 12, opacity: 0, duration: 0.6, delay: 0.2 });
    localStorage.setItem(KEY, "1");
  }
});


