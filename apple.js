const pptr = require('puppeteer');
const { writeFile } = require('fs/promises');
const json2csv = require('json2csv');

const main = async () => {
  const browser = await pptr.launch({
    headless: false,
    defaultViewport: {
      height: 768,
      width: 1366,
    },
  });

  const pg = await browser.newPage();
  await pg.goto('https://www.myntra.com/');

  await pg.waitForSelector('.desktop-searchBar', { visible: true });
  await pg.type('.desktop-searchBar', 'Calvin Klein Perfumes');
  await pg.keyboard.press('Enter');

  await pg.waitForSelector('.product-price', { timeout: 5000 }).catch(() => {
    console.error('Timeout: Search results not found.');
  });

  const p_data = await pg.evaluate(() => {
    const p_ele = document.querySelectorAll('.product-productMetaInfo');
    const prdData = [];

    for (const el of p_ele) {
      const name = el.querySelector('.product-product').textContent.trim();
      const price = el.querySelector('.product-price span').textContent.trim();
      const description = el.querySelector('.product-product').textContent.trim();

      prdData.push({
        name,
        price,
        description,
      });
    }

    return prdData;
  });

  const csv = json2csv.parse(p_data, { fields: ['name', 'price', 'description'] });
  await writeFile('products.csv', csv);

  await browser.close();
};

main();

