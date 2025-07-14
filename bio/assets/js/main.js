console.log("🔗 Bio App iniciando...");

document.addEventListener("DOMContentLoaded", async () => {

  try {
    await waitForSupabase();
    await window.bioComponent.init();
  } catch (error) {
    console.error("❌ Erro ao inicializar Bio App:", error);
    showInitializationError();
  }
});

function waitForSupabase() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkSupabase = () => {
      attempts++;

      if (window.supabase && window.bioSupabaseService) {
        console.log("📡 Supabase disponível");
        resolve();
      } else if (attempts < maxAttempts) {
        setTimeout(checkSupabase, 100);
      } else {
        reject(new Error("Timeout aguardando Supabase"));
      }
    };

    checkSupabase();
  });
}

function showInitializationError() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
  }

  const errorState = document.getElementById("error-state");
  if (errorState) {
    errorState.classList.remove("hidden");
  }
}

function getDeviceType() {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, wait) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
}

window.addEventListener(
  "resize",
  debounce(() => {
    console.log(`📱 Dispositivo: ${getDeviceType()}`);

    document.body.className =
      document.body.className.replace(/device-\w+/g, "").trim() +
      ` device-${getDeviceType()}`;
  }, 250)
);

window.addEventListener("error", (event) => {
  console.error("❌ Erro global capturado:", event.error);

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("🐛 Modo desenvolvimento - mostrando erro detalhado");
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Promise rejeitada:", event.reason);

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("🐛 Modo desenvolvimento - mostrando promise rejection");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    console.log("👋 Usuário saiu da página");
  } else {
    console.log("👀 Usuário voltou para a página");
  }
});

window.addEventListener("load", () => {
  if ("performance" in window && "timing" in window.performance) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;

    console.log(`⚡ Página carregada em ${loadTime}ms`);

    if (loadTime > 3000) {
      console.warn("⚠️ Página demorou mais que 3 segundos para carregar");
    }
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("📱 Service Worker registrado:", registration.scope);
      })
      .catch((error) => {
      });
  });
}

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "r") {
    if (window.bioComponent) {
      e.preventDefault();
      window.bioComponent.refresh();
    }
  }

  if (e.key === "Escape") {
    const toast = document.getElementById("toast");
    if (toast && !toast.classList.contains("hidden")) {
      toast.classList.add("hidden");
    }
  }
});

document.body.classList.add(`device-${getDeviceType()}`);

window.bioUtils = {
  getDeviceType,
  isMobile,
  debounce,
  throttle,
};


if ("PerformanceObserver" in window) {
  const lcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
    }
  });

  lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
    }
  });

  fidObserver.observe({ entryTypes: ["first-input"] });
}
