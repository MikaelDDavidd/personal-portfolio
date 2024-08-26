document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const contentDiv = document.getElementById('content');

  // Definição da função elementToggleFunc
  const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

  function attachEventListeners() {
    // sidebar variables
    const sidebar = document.querySelector("[data-sidebar]");
    const sidebarBtn = document.querySelector("[data-sidebar-btn]");

    // sidebar toggle functionality for mobile
    if (sidebarBtn) {
      sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
    }

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
});