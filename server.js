const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Кеширование фонового изображения
let backgroundImageDataUrl = null;

function getBackgroundImage() {
  if (!backgroundImageDataUrl) {
    const backgroundImagePath = path.join(__dirname, 'pass2.jpg');
    const backgroundImageBase64 = fs.readFileSync(backgroundImagePath, { encoding: 'base64' });
    backgroundImageDataUrl = `data:image/jpeg;base64,${backgroundImageBase64}`;
  }
  return backgroundImageDataUrl;
}

const surnames = [
  { ua: 'ТКАЧЕНКО', en: 'TKACHENKO' },
  { ua: 'ПЕТРЕНКО', en: 'PETRENKO' },
  { ua: 'КОВАЛЕНКО', en: 'KOVALENKO' },
  { ua: 'БОНДАРЕНКО', en: 'BONDARENKO' },
  { ua: 'МЕЛЬНИК', en: 'MELNYK' },
  { ua: 'ШЕВЧЕНКО', en: 'SHEVCHENKO' },
  { ua: 'БОЙКО', en: 'BOIKO' },
  { ua: 'КОВАЛЬ', en: 'KOVAL' },
  { ua: 'ПОЛІЩУК', en: 'POLISHCHUK' },
  { ua: 'ІВАНЕНКО', en: 'IVANENKO' },
  { ua: 'ГРИЦЕНКО', en: 'HRYTSENKO' },
  { ua: 'ПАВЛЕНКО', en: 'PAVLENKO' },
  { ua: 'САВЧЕНКО', en: 'SAVCHENKO' },
  { ua: 'ЛИТВИНЕНКО', en: 'LYTVYNENKO' },
  { ua: 'РОМАНЕНКО', en: 'ROMANENKO' },
  { ua: 'СЕМЕНКО', en: 'SEMENKO' },
  { ua: 'КРАВЧЕНКО', en: 'KRAVCHENKO' },
  { ua: 'КЛИМЕНКО', en: 'KLYMENKO' },
  { ua: 'МАРЧЕНКО', en: 'MARCHENKO' },
  { ua: 'СИДОРЕНКО', en: 'SYDORENKO' },
];

const names = [
  { ua: "МАР'ЯНА", en: 'MARIANA' },
  { ua: 'ОЛЕНА', en: 'OLENA' },
  { ua: 'ІРИНА', en: 'IRYNA' },
  { ua: 'ТЕТЯНА', en: 'TETIANA' },
  { ua: 'НАТАЛІЯ', en: 'NATALIIA' },
  { ua: 'КАТЕРИНА', en: 'KATERYNA' },
  { ua: 'АНАСТАСІЯ', en: 'ANASTASIIA' },
  { ua: 'ВІКТОРІЯ', en: 'VIKTORIIA' },
  { ua: 'ЮЛІЯ', en: 'YULIIA' },
  { ua: 'ДАРИНА', en: 'DARYNA' },
  { ua: 'СОФІЯ', en: 'SOFIIA' },
  { ua: 'АННА', en: 'ANNA' },
  { ua: 'МАРІЯ', en: 'MARIIA' },
  { ua: 'ОКСАНА', en: 'OKSANA' },
  { ua: 'ЛЮДМИЛА', en: 'LIUDMYLA' },
];

const patronymics = [
  'ІВАНІВНА',
  'ПЕТРІВНА',
  'ОЛЕКСАНДРІВНА',
  'МИХАЙЛІВНА',
  'АНДРІЇВНА',
  'СЕРГІЇВНА',
  'ВОЛОДИМИРІВНА',
  'ВІКТОРІВНА',
  'ДМИТРІВНА',
  'ВАСИЛІВНА',
  'МИКОЛАЇВНА',
  'ЮРІЇВНА',
  'ТАРАСІВНА',
  'БОГДАНІВНА',
  'РОМАНІВНА',
];

const passportImages = [
  path.join(__dirname, 'face1.jpg'),
  path.join(__dirname, 'face2.jpg'),
  path.join(__dirname, 'face3.jpg'),
  path.join(__dirname, 'face4.jpg'),
  path.join(__dirname, 'face5.jpg'),
  path.join(__dirname, 'face6.jpg'),
  path.join(__dirname, 'face7.jpg'),
  path.join(__dirname, 'face8.jpg'),
  path.join(__dirname, 'face9.jpg'),
  path.join(__dirname, 'face10.jpg'),
  path.join(__dirname, 'face11.jpg'),
  path.join(__dirname, 'face12.jpg'),
  path.join(__dirname, 'face13.jpg'),
  path.join(__dirname, 'face14.jpg'),
];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .split('T')[0];
}

function generateRandomNumber(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generateRandomField(field) {
  switch (field) {
    case 'name':
      return names[Math.floor(Math.random() * names.length)];
    case 'surname':
      return surnames[Math.floor(Math.random() * surnames.length)];
    case 'patronymic':
      return patronymics[Math.floor(Math.random() * patronymics.length)];
    case 'sex':
      return 'Ж/F';
    case 'birthDate':
      return generateRandomDate(new Date(1970, 0, 1), new Date(2000, 11, 31));
    case 'recordNo':
      const birthDate = generateRandomDate(new Date(1970, 0, 1), new Date(2000, 11, 31));
      return `${birthDate.split('-').join('')}-${generateRandomNumber(5)}`;
    case 'documentNo':
      return generateRandomNumber(9);
    case 'expiryDate':
      const today = new Date();
      return new Date(today.getFullYear() + 10, today.getMonth(), today.getDate())
        .toISOString()
        .split('T')[0];
    case 'photo':
      const randomPhotoIndex = Math.floor(Math.random() * passportImages.length);
      return fs.readFileSync(passportImages[randomPhotoIndex], { encoding: 'base64' });
    default:
      return '';
  }
}

app.get('/generate-passport', async (req, res) => {
  let { surname, name, patronymic, sex, birthDate, recordNo, expiryDate, documentNo, surnameLat, nameLat, photo } = req.query;

  if (!surname || !surnameLat) {
    const randomSurname = generateRandomField('surname');
    surname = surname || randomSurname.ua;
    surnameLat = surnameLat || randomSurname.en;
  }

  if (!name || !nameLat) {
    const randomName = generateRandomField('name');
    name = name || randomName.ua;
    nameLat = nameLat || randomName.en;
  }
  
  patronymic = patronymic || generateRandomField('patronymic');
  sex = sex || generateRandomField('sex');
  birthDate = birthDate || generateRandomField('birthDate');
  recordNo = recordNo || generateRandomField('recordNo');
  expiryDate = expiryDate || generateRandomField('expiryDate');
  documentNo = documentNo || generateRandomField('documentNo');
  photo = photo || `data:image/jpeg;base64,${generateRandomField('photo')}`;

  try {
    // Используем кешированное фоновое изображение
    const backgroundImageDataUrl = getBackgroundImage();

    // Конфигурация для Vercel
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 500 });

    await page.setContent(`
      <div style="position: relative; width: 100%; height: auto;">
        <img
          src="${backgroundImageDataUrl}"
          alt="Passport Template"
          style="width: 100%; height: auto;"
        />
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: start; justify-content: start; padding: 4%;">
          <div style="position: absolute; top: 30%; left: 11%; max-width: 22%; height: auto;">
            <img src="${photo}" alt="Passport Photo" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="position: relative; top: 20%; left: 39.5%; font-size: x-small;">
            <p>${surname}</p>
            <p>${surnameLat}</p>
          </div>
          <div style="position: relative; top: 22%; left: 39.5%; font-size: x-small;">
            <p>${name}</p>
            <p>${nameLat}</p>
          </div>
          <div style="position: relative; top: 24%; left: 39.5%; font-size: x-small;">
            <p>${patronymic}</p>
          </div>
          <div style="position: relative; top: 26%; left: 39.5%; font-size: x-small;">
            <p>${sex}</p>
          </div>
          <div style="position: absolute; top: 54%; left: 61.5%; font-size: x-small;">
            <p>${'Україна/UKR'}</p>
          </div>
          <div style="position: relative; top: 28%; left: 39.5%; font-size: x-small;">
            <p>${birthDate}</p>
          </div>
          <div style="position: relative; top: 21%; left: 62.5%; font-size: x-small;">
            <p>${recordNo}</p>
          </div>
          <div style="position: relative; top: 23%; left: 39.5%; font-size: x-small;">
            <p>${expiryDate}</p>
          </div>
          <div style="position: relative; top: 16.5%; left: 62.5%; font-size: x-small;">
            <p>${documentNo}</p>
          </div>
        </div>
      </div>
    `);

    const imageBuffer = await page.screenshot();
    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Ошибка при генерации паспорта:', error);
    res.status(500).send('Ошибка сервера.');
  }
});

// Vercel ожидает экспорт обработчика
module.exports = app;
