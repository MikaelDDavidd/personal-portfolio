document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const contentDiv = document.getElementById('content');

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => {
      toast.className = toast.className.replace("show", "");
    }, 3000); // O toast desaparecerá após 3 segundos
  };

  // Definição da função elementToggleFunc
  const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

  // Attach events that need to persist across page changes
  function attachPersistentEvents() {
    // sidebar variables
    const sidebar = document.querySelector("[data-sidebar]");
    const sidebarBtn = document.querySelector("[data-sidebar-btn]");

    // Remove event listener if it exists (to prevent duplication)
    if (sidebarBtn) {
      sidebarBtn.removeEventListener("click", toggleSidebar);
      sidebarBtn.addEventListener("click", toggleSidebar);
    }

    function toggleSidebar() {
      elementToggleFunc(sidebar);
    }
  }

  // Reattach events after content is loaded
  function attachEventListeners() {
    // Aqui você pode reanexar eventos para outros elementos carregados dinamicamente

    // testimonials variables
    const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
    const modalContainer = document.querySelector("[data-modal-container]");
    const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
    const overlay = document.querySelector("[data-overlay]");

    // modal variables
    const modalImg = document.querySelector("[data-modal-img]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalText = document.querySelector("[data-modal-text]");

    // modal toggle function
    const testimonialsModalFunc = function () {
      if (modalContainer && overlay) {
        modalContainer.classList.toggle("active");
        overlay.classList.toggle("active");
      }
    }

    // add click event to all modal items
    if (testimonialsItem) {
      testimonialsItem.forEach(item => {
        item.addEventListener("click", function () {
          if (modalImg && modalTitle && modalText) {
            modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
            modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
            modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
            modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
            testimonialsModalFunc();
          }
        });
      });
    }

    // add click event to modal close button
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", testimonialsModalFunc);
    }
    if (overlay) {
      overlay.addEventListener("click", testimonialsModalFunc);
    }

    // custom select variables
    const select = document.querySelector("[data-select]");
    const selectItems = document.querySelectorAll("[data-select-item]");
    const selectValue = document.querySelector("[data-selecct-value]");
    const filterBtn = document.querySelectorAll("[data-filter-btn]");

    if (select) {
      select.addEventListener("click", function () { elementToggleFunc(this); });
    }

    // add event in all select items
    if (selectItems) {
      selectItems.forEach(item => {
        item.addEventListener("click", function () {
          let selectedValue = this.innerText.toLowerCase();
          if (selectValue) selectValue.innerText = this.innerText;
          elementToggleFunc(select);
          filterFunc(selectedValue);
        });
      });
    }

    // filter variables
    const filterItems = document.querySelectorAll("[data-filter-item]");

    const filterFunc = function (selectedValue) {
      filterItems.forEach(item => {
        if (selectedValue === "all") {
          item.classList.add("active");
        } else if (selectedValue === item.dataset.category) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
    }

    // add event in all filter button items for large screen
    if (filterBtn.length > 0) {
      let lastClickedBtn = filterBtn[0];
      filterBtn.forEach(btn => {
        btn.addEventListener("click", function () {
          let selectedValue = this.innerText.toLowerCase();
          if (selectValue) selectValue.innerText = this.innerText;
          filterFunc(selectedValue);
          lastClickedBtn.classList.remove("active");
          this.classList.add("active");
          lastClickedBtn = this;
        });
      });
    }

    // contact form variables
    const form = document.querySelector("[data-form]");
    const formInputs = document.querySelectorAll("[data-form-input]");
    const formBtn = document.querySelector("[data-form-btn]");

    // add event to all form input fields
    if (formInputs) {
      formInputs.forEach(input => {
        input.addEventListener("input", function () {
          if (form && form.checkValidity()) {
            formBtn.removeAttribute("disabled");
          } else {
            formBtn.setAttribute("disabled", "");
          }
        });
      });
    }

        // download certificate
        const certificateLinks = document.querySelectorAll('.clients-item a[data-certificate]');
        certificateLinks.forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();  // Prevent the default link behavior
            const certificateName = this.getAttribute('data-certificate');
            const linkElement = document.createElement('a');
            linkElement.href = `./assets/${certificateName}`;
            linkElement.download = certificateName;
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
          });
        });
      

    // Handle form submission using EmailJS
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullname = document.querySelector('input[name="from_name"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const message = document.querySelector('textarea[name="message"]').value;

        emailjs.send("service_34r5f3e", "template_ys42nla", {
          from_name: fullname,
          email: email,
          message: message
        })
        .then((response) => {
          showToast('Message sent successfully!');
        }, (error) => {
          showToast('Failed to send message. Please try again later.');
          console.error('FAILED...', error);
        });
      });
    }
  }
  
  function loadContent(page) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `./pages/${page}.html`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        contentDiv.innerHTML = xhr.responseText;
        attachEventListeners(); // Attach events after content load

        // Adicionando a classe "active" ao artigo carregado
        const article = contentDiv.querySelector("article");
        if (article) {
          article.classList.add("active");
        }
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        console.error(`Error loading page: ${page}`);
      }
    };
    xhr.send();
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(link => link.classList.remove('active'));
      this.classList.add('active');

      const page = this.textContent.trim().toLowerCase();
      loadContent(page);
    });
  });

  // Load the default page (About) on initial load
  loadContent('about');

  // Attach persistent events on initial load
  attachPersistentEvents();
});