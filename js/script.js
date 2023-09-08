const API_URL = "https://workspace-methed.vercel.app/"; //адрес сервера
const LOCATION_URL = "api/locations"; //ручка/endpoint городов
const VACANCY_URL = "api/vacancy"; //ручка/endpoint вакансий

const cardsList = document.querySelector('.cards__list');

let lastUrl = '';
const pagination = {};

// функция получения данных с сервера
const getData = async (url, cbSuccess, cbError) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    cbSuccess(data);
  } catch (err) {
    cbError(err);
  }
}

// функция создания карточки вакансии 
const createCard = (vacancy) => `
  <article class="vacancy" tabindex="0" data-id="${vacancy.id}">
    <img class="vacancy__img" src="${API_URL}${vacancy.logo}" alt="Логотип компании ${vacancy.company}">

    <p class="vacancy__company">${vacancy.company}</p>

    <h3 class="vacancy__title">${vacancy.title}</h3>

    <ul class="vacancy__fields">
      <li class="vacancy__field">от ${parseInt(vacancy.salary).toLocaleString()}₽</li>
      <li class="vacancy__field">${vacancy.type}</li>
      <li class="vacancy__field">${vacancy.format}</li>
      <li class="vacancy__field">${vacancy.experience}</li>
    </ul>
  </article>
`;

// функция создания элементов li списка ul
const createCards = (data) =>
  data.vacancies.map((vacancy) => { // перебор вакансий с помощью map
    const li = document.createElement('li');
    li.classList.add('cards__item');
    li.insertAdjacentHTML("beforeend", createCard(vacancy));
    return li;
  })

// функция перерендера карт
const renderVacancies = (data) => {
  cardsList.textContent = '';
  const cards = createCards(data);
  cardsList.append(...cards); // добавление элементов ввиде массива(...) в конец cardsList

  if (data.pagination) {
    Object.assign(pagination, data.pagination); // копируем объект из data.pagination в pagination
  }

  observer.observe(cardsList.lastElementChild);
}

const renderMoreVacancies = (data) => {
  const cards = createCards(data);
  cardsList.append(...cards);

  if (data.pagination) {
    Object.assign(pagination, data.pagination); // копируем объект из data.pagination в pagination
  }

  observer.observe(cardsList.lastElementChild);
}

const loadMoreVacancies = () => {
  if (pagination.totalPages > pagination.currentPage) {
    const urlWithParams = new URL(lastUrl);
    urlWithParams.searchParams.set('page', pagination.currentPage + 1);
    urlWithParams.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);

    getData(urlWithParams, renderMoreVacancies, renderError).then(() => {
      lastUrl = urlWithParams;
    });
  }
}

const renderError = err => {
  console.warn();
}

// функция верстки детальной карточки вакансии
const createDetailVacancy = ({
  id,
  title,
  company,
  description,
  email,
  salary,
  type,
  format,
  experience,
  location,
  logo
}) => `
  <article class="detail">
    <div class="detail__header">
      <img class="detail__logo" src="${API_URL}${logo}" alt="Логотип компании ${company}">

      <p class="detail__company">${company}</p>

      <h2 class="detail__title">${title}</h2>
    </div>

    <div class="detail__main">
      <p class="deatail__description">${description.replaceAll("\n", "<br>")}</p>

      <ul class="detail__fields">
        <li class="detail__field">от ${parseInt(salary).toLocaleString()}₽</li>
        <li class="detail__field">${type}</li>
        <li class="detail__field">${format}</li>
        <li class="detail__field">${experience}</li>
        <li class="detail__field">${location}</li>
      </ul>
    </div>

    <p class="detail__resume">Отправляйте резюме на 
      <a class="detail__link" href="mailto:${email}">${email}</a>
    </p>
  </article>
`;


// рендер модального окна
const renderModal = (data) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  const modalMain = document.createElement('div');
  modalMain.classList.add('modal__main');
  modalMain.innerHTML = createDetailVacancy(data);

  const modalClose = document.createElement('button');
  modalClose.classList.add('modal__close');
  modalClose.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M10.7831 10L15.3887 5.39444C15.4797 5.28816 15.5272 5.15145 15.5218 5.01163C15.5164 4.87181 15.4585 4.73918 15.3595 4.64024C15.2606 4.5413 15.128 4.48334 14.9881 4.47794C14.8483 4.47254 14.7116 4.52009 14.6053 4.61111L9.99977 9.21666L5.39421 4.60555C5.2896 4.50094 5.14771 4.44217 4.99977 4.44217C4.85182 4.44217 4.70994 4.50094 4.60532 4.60555C4.50071 4.71017 4.44194 4.85205 4.44194 5C4.44194 5.14794 4.50071 5.28983 4.60532 5.39444L9.21643 10L4.60532 14.6056C4.54717 14.6554 4.49993 14.7166 4.46659 14.7856C4.43324 14.8545 4.4145 14.9296 4.41155 15.0061C4.40859 15.0826 4.42148 15.1589 4.44941 15.2302C4.47734 15.3015 4.51971 15.3662 4.57385 15.4204C4.62799 15.4745 4.69274 15.5169 4.76403 15.5448C4.83532 15.5727 4.91162 15.5856 4.98813 15.5827C5.06464 15.5797 5.13972 15.561 5.20864 15.5276C5.27757 15.4943 5.33885 15.447 5.38866 15.3889L9.99977 10.7833L14.6053 15.3889C14.7116 15.4799 14.8483 15.5275 14.9881 15.5221C15.128 15.5167 15.2606 15.4587 15.3595 15.3598C15.4585 15.2608 15.5164 15.1282 15.5218 14.9884C15.5272 14.8485 15.4797 14.7118 15.3887 14.6056L10.7831 10Z"/>
      </g>
    </svg>
  `;
  modalMain.append(modalClose);

  modal.append(modalMain);
  document.body.append(modal);

  //закрытие модального окна
  modal.addEventListener('click', ({ target }) => {
    if (target === modal || target.closest('.modal__close')) {
      modal.remove();
    }
  })
}

// функция для открытия модального окна по найденному id
const openModal = (id) => {
  getData(`${API_URL}${VACANCY_URL}/${id}`, renderModal, renderError);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreVacancies();
      }
    });
  },
  {
    rootMargin: "100px",
  },
);

const openFilter = (btn, dropDown, classNameBtn, classNameDd) => {
  dropDown.style.height = `${dropDown.scrollHeight}px`; // узнаем у элемента его скрытую высоту и устанавливаем ее
  btn.classList.add(classNameBtn);
  dropDown.classList.add(classNameDd);
}

const closeFilter = (btn, dropDown, classNameBtn, classNameDd) => {
  btn.classList.remove(classNameBtn);
  dropDown.classList.remove(classNameDd);
  dropDown.style.height = ''; // высота будет работать та, которая указана в css

}

// самая главная функция, которая запускается в самом начале
const init = () => {
  const filterForm = document.querySelector('.filter__form');
  const vacanciesFilterBtn = document.querySelector('.vacancies__filter-btn');
  const vacanciesFilter = document.querySelector('.vacancies__filter');

  vacanciesFilterBtn.addEventListener('click', () => {
    if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
      closeFilter(
        vacanciesFilterBtn,
        vacanciesFilter,
        'vacancies__filter-btn_active',
        'vacancies__filter_active',
      );
    } else {
      openFilter(
        vacanciesFilterBtn,
        vacanciesFilter,
        'vacancies__filter-btn_active',
        'vacancies__filter_active',
      );
    }
  });

  window.addEventListener('resize', () => { // событие изменения высоты или ширины окна браузера
    if (vacanciesFilterBtn.classList.contains('vacancies__filter-btn_active')) {
      // 1) 
      // vacanciesFilter.style.height = `${vacanciesFilter.scrollHeight}px`;

      // 2
      closeFilter(
        vacanciesFilterBtn,
        vacanciesFilter,
        'vacancies__filter-btn_active',
        'vacancies__filter_active',
      );
    }


  });

  // select city 
  const citySelect = document.getElementById('city');
  const cityChoices = new Choices(citySelect, {
    itemSelectText: '',
  });

  // загрузка городов с сервера в select
  getData(
    `${API_URL}${LOCATION_URL}`,
    (locationData) => {
      const locations = locationData.map((location) => ({
        value: location,
      }));

      cityChoices.setChoices(locations, 'value', 'label', false);
    },
    (err) => {
      console.log(err);
    }
  );

  //cards
  // загрузка вакансий с сервера
  const urlWithParams = new URL(`${API_URL}${VACANCY_URL}`);

  urlWithParams.searchParams.set('limit', window.innerWidth < 768 ? 6 : 12);
  urlWithParams.searchParams.set('page', 1);

  getData(urlWithParams, renderVacancies, renderError).then(() => {
    lastUrl = urlWithParams; // отслеживаем последний адрес запроса
  });

  // modal
  // событие для открытия модального окна
  // узнаем ид вакансии для открытия модального окна
  cardsList.addEventListener('click', ({ target }) => { // Деструктуризация
    const vacancyCard = target.closest('.vacancy'); // ищем ближайший класс

    if (vacancyCard) {
      const vacancyId = vacancyCard.dataset.id;
      openModal(vacancyId);
    }
  });

  // открытие модального окна по нажатию клавиши
  cardsList.addEventListener('keydown', ({ code, target }) => {
    const vacancyCard = target.closest('.vacancy');

    if ((code === 'Enter' || code === 'NumpadEnter') && vacancyCard) {
      const vacancyId = vacancyCard.dataset.id;
      openModal(vacancyId);
      target.blur(); // снимаем фокус с элемента, повторное нажатие Enter не будет работать после открытия окна
    }
  });

  // filter
  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(filterForm); // объект FormData позволяет получить из формы данные

    const urlWithParam = new URL(`${API_URL}${VACANCY_URL}`);

    // формируем ссылку с параметрами
    formData.forEach((value, key) => {
      urlWithParam.searchParams.append(key, value);
    });

    getData(urlWithParam, renderVacancies, renderError).then(() => {
      lastUrl = urlWithParam; // отслеживаем последний адрес запроса
    }).then(() => {
      closeFilter(
        vacanciesFilterBtn,
        vacanciesFilter,
        'vacancies__filter-btn_active',
        'vacancies__filter_active',
      );
    }
    );
  });
}

init();