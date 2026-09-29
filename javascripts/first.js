// ==========================================================================
// BRICK — script.js
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initBurgerMenu();
  initServicesCarousel();
  initButtons();
  initFaqAccordion();
  initContactForm();
});

/* ---------- Бургер-меню (мобильный/планшетный хедер) ---------- */
function initBurgerMenu() {
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  if (!burger || !nav) return;

  const links = nav.querySelectorAll('.header__nav-link');

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', toggleMenu);

  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) toggleMenu();
    });
  });
}

/* ---------- Бесконечная карусель "Сервисы" ---------- */
function initServicesCarousel() {
  const viewport = document.querySelector('.services__viewport');
  const track = document.querySelector('.services__track');
  const prevBtn = document.querySelector('.services__control--prev');
  const nextBtn = document.querySelector('.services__control--next');
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const originalCards = Array.from(track.children);
  const total = originalCards.length;

  // Клонируем полный набор карточек один раз в конец трека —
  // это даёт возможность бесшовной бесконечной прокрутки вперёд и назад.
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let index = 0;
  let step = 0;
  let isAnimating = false;

  const getStep = () => {
    const card = track.children[0];
    const cardRect = card.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cardRect.width + gap;
  };

  const setPosition = (animated) => {
    track.classList.toggle('no-transition', !animated);
    track.style.transform = `translateX(-${index * step}px)`;
  };

  const recalc = () => {
    step = getStep();
    setPosition(false);
  };

  recalc();
  window.addEventListener('resize', recalc);

  track.addEventListener('transitionend', () => {
    isAnimating = false;
    if (index >= total) {
      index -= total;
      setPosition(false);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    index += 1;
    setPosition(true);
  });

  prevBtn.addEventListener('click', () => {
    if (isAnimating) return;
    if (index === 0) {
      // Мгновенно переносим в конец продублированного набора,
      // затем плавно анимируем шаг назад — создаёт эффект бесконечности.
      index = total;
      setPosition(false);
      // Форсируем перерасчёт стилей перед анимированным шагом
      void track.offsetWidth;
    }
    isAnimating = true;
    index -= 1;
    setPosition(true);
  });
}

/* ---------- Кнопки "О нас" / "Написать" — заглушки под будущий функционал ---------- */
function initButtons() {
  const aboutBtn = document.querySelector('.js-about-btn');
  const contactBtn = document.querySelector('.js-contact-btn');

  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      // TODO: подключить форму обратной связи / почтовый клиент
      console.log('Кнопка "Написать" — функционал будет добавлен позже');
    });
  }
}

/* ---------- FAQ-аккордеон: плавное раскрытие ответа по клику на плюс ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Аккордеон: открываем только один вопрос за раз —
      // остальные плавно закрываются. Уберите этот forEach,
      // если нужно разрешить несколько открытых ответов одновременно.
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ---------- Форма "Остались вопросы?": валидация + попап об успехе ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (!form) return;

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const validateField = (field) => {
    let valid = field.checkValidity();

    // Простая доп. проверка телефона: достаточно 10+ цифр
    if (valid && field.type === 'tel') {
      const digits = field.value.replace(/\D/g, '');
      valid = digits.length >= 10;
    }

    field.classList.toggle('is-invalid', !valid);
    return valid;
  };

  // Живая валидация: убираем подсветку ошибки, как только поле исправили
  form.querySelectorAll('.form__input[required]').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const requiredFields = Array.from(form.querySelectorAll('.form__input[required]'));
    const allValid = requiredFields
      .map((field) => validateField(field))
      .every(Boolean);

    if (!allValid) {
      requiredFields.find((f) => f.classList.contains('is-invalid'))?.focus();
      return;
    }

    // Здесь в будущем будет реальная отправка на сервер (fetch/XHR).
    // Пока — просто показываем попап об успехе и очищаем форму.
    openModal();
    form.reset();
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}
/* ==========================================================
   Страница "Профиль"
   ========================================================== */
const profileForm = document.querySelector('#profile-form');
 
if (profileForm) {
  const STORAGE_KEY = 'brick-profile';
  const popup = document.querySelector('#save-popup');
  const userName = document.querySelector('[data-user-name]');
  const userEmail = document.querySelector('[data-user-email]');
  let popupTimer;
 
  /* Обновить имя и почту в боковом меню */
  const updateSidebar = (data) => {
    if (data.name) userName.textContent = data.name;
    if (data.email) userEmail.textContent = data.email;
  };
 
  /* Заполнить форму сохранёнными данными */
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.entries(saved).forEach(([field, value]) => {
      if (profileForm.elements[field]) profileForm.elements[field].value = value;
    });
    updateSidebar(saved);
  } catch (error) {
    /* данные недоступны — форма остаётся пустой */
  }
 
  /* Кнопка-карандаш ставит курсор в первое поле */
  document.querySelector('[data-edit]').addEventListener('click', () => {
    profileForm.elements.name.focus();
  });
 
  /* Сохранение и попап */
  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(profileForm));
 
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      /* если хранилище недоступно, попап всё равно покажем */
    }
 
    updateSidebar(data);
    popup.showModal();
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => popup.close(), 3000);
  });
 
  /* Закрытие попапа: кнопка или клик по фону */
  popup.addEventListener('click', (event) => {
    if (event.target === popup || event.target.hasAttribute('data-popup-close')) {
      popup.close();
    }
  });
}
 