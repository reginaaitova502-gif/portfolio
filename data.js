// ВСЁ, ЧТО МЕНЯЕТСЯ ЧАСТО, ЛЕЖИТ ЗДЕСЬ: контакты, цены, работы, тексты карточек.

window.SITE = {
  // Вставь свои ссылки. Пока пусто, кнопки ведут к блоку контактов.
  contacts: {
    whatsapp: 'https://wa.me/79871194777',
    telegram: 'https://t.me/ReginaA1tova',
  },

  services: [
    { title: 'Простой Reels', text: 'Картинка или анимированная AI-картинка в короткое видео с текстом', price: '700 ₽' },
    { title: 'Reels с озвучкой и переходами', text: 'До 1 минуты', price: '1500 ₽' },
    { title: 'Рисованный Reels', text: '2D-анимация в Claude. Цена зависит от сложности и времени', price: '700 ₽', from: true },
    { title: 'Полностью собранное видео / AI-фильм', text: 'Зависит от сценария и сложности', price: '2000 ₽', from: true },
    { title: 'Рекламное видео для бренда в AI', text: 'Ролик под ваш продукт с нуля', price: '4000 ₽', from: true },
    { title: 'Оформление постов в карусель', text: 'До 10 слайдов', price: '700 ₽' },
    { title: 'Ведение Instagram-страницы', text: '3 Reels в неделю, 2 поста-карусели в неделю и помощь с контент-планом', price: '20 000 ₽', wide: true },
  ],

  // Работы. cat: ai | ads | anim | carousel
  // video: полный ролик (открывается в окне), loop: короткий кусок без звука для превью,
  // poster: обложка, views: просмотры, slides: картинки карусели.
  portfolio: [
    { cat: 'ai', title: 'Исраф и показуха', video: 'works/israf.mp4', loop: 'works/israf-loop.mp4', poster: 'works/israf.jpg', ratio: '16/9', views: '179 тыс.' },
    { cat: 'ai', title: 'Неблагодарный', video: 'works/neblagodarny.mp4', loop: 'works/neblagodarny-loop.mp4', poster: 'works/neblagodarny.jpg', ratio: '16/9', views: '224 тыс.' },
    { cat: 'anim', title: 'Садака бесплатно', video: 'works/sadaka.mp4', loop: 'works/sadaka-loop.mp4', poster: 'works/sadaka.jpg' },
    { cat: 'ads', title: 'Намазное платье «Олива»', video: 'works/namaz.mp4', loop: 'works/namaz-loop.mp4', poster: 'works/namaz.jpg' },
    { cat: 'carousel', title: 'Программа клуба', poster: 'works/club/01.jpg', ratio: '4/5',
      slides: Array.from({ length: 16 }, (_, i) => `works/club/${String(i + 1).padStart(2, '0')}.jpg`) },
    { cat: 'anim', title: 'Половина финика', video: 'works/finik.mp4', loop: 'works/finik-loop.mp4', poster: 'works/finik.jpg' },
  ],

  categories: [
    { id: 'all', label: 'Все' },
    { id: 'ai', label: 'AI Reels' },
    { id: 'ads', label: 'Реклама' },
    { id: 'anim', label: '2D-анимация' },
    { id: 'carousel', label: 'Карусели' },
  ],

  // Результаты: скрины просмотров из Instagram.
  results: [
    { img: 'works/neblagodarny-views.jpg', label: '224 тыс. просмотров', note: 'AI Reels «Неблагодарный»' },
    { img: 'works/israf-views.jpg', label: '179 тыс. просмотров', note: 'AI Reels «Исраф и показуха»' },
  ],

  why: [
    { title: 'Современный визуал', text: 'Ролики выглядят свежо и в тренде' },
    { title: 'Монтаж и AI в одном месте', text: 'Не нужно искать разных исполнителей' },
    { title: 'Креативный подход', text: 'Предлагаю идеи, а не только собираю' },
    { title: 'Под вашу задачу', text: 'Формат подбираю под цель и аудиторию' },
    { title: 'Помогаю с подачей', text: 'Подскажу, как показать продукт красиво' },
    { title: 'От простого до сложного', text: 'Можно заказать и простой ролик, и большой AI-проект' },
  ],

  steps: [
    'Вы пишете мне в Telegram или WhatsApp',
    'Обсуждаем задачу',
    'Предлагаю формат и стоимость',
    'Согласовываем детали',
    'Собираю материал',
    'Вы получаете готовый результат',
  ],
};
