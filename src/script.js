/** @type {HTMLTableSectionElement} */
const drinksTableBody = document.querySelector('.drinkTable tbody')
/** @type {HTMLSpanElement} */
const shotsEl = document.getElementById('shots')

/** @type {HTMLInputElement} */
const newDrinkCountEl = document.querySelector('.newDrinkCount')
/** @type {HTMLInputElement} */
const newDrinkNameEl = document.querySelector('.newDrinkName')
/** @type {HTMLInputElement} */
const newDrinkVolumeMlEl = document.querySelector('.newDrinkVolumeMl')
/** @type {HTMLInputElement} */
const newDrinkAlcoholPercentageEl = document.querySelector('.newDrinkAlcoholPercentage')
/** @type {HTMLButtonElement} */
const newDrinkAddEl = document.querySelector('.newDrinkAdd')
/** @type {HTMLButtonElement} */
const clearListEl = document.querySelector('.clearList')

const siteLocale = 'sv-SE'
const localStorageDrinksKey = 'drinks'

/**
 * @typedef {Object} Drink
 * @property {Number} count
 * @property {String} name
 * @property {Number} volumeMl
 * @property {Number} alcoholContent
 */

/** @type {Drink[]} */
const drinks = JSON.parse(localStorage.getItem(localStorageDrinksKey)) || []
drinks.forEach(drink => { addRow(drink) })
updateTotalShots()

newDrinkAddEl.addEventListener('click', () => {
  const newDrinkCount = newDrinkCountEl.valueAsNumber
  const newDrinkName = newDrinkNameEl.value
  const newDrinkVolumeMl = newDrinkVolumeMlEl.valueAsNumber
  const newDrinkAlcoholContent = newDrinkAlcoholPercentageEl.valueAsNumber / 100

  if (isNaN(newDrinkCount) || newDrinkCount <= 0) { return }
  if (newDrinkName === '') { return }
  if (isNaN(newDrinkVolumeMl) || newDrinkVolumeMl < 0) { return }
  if (isNaN(newDrinkAlcoholContent) || newDrinkAlcoholContent < 0 || newDrinkAlcoholContent > 100) { return }

  const newDrink = { count: newDrinkCount, name: newDrinkName, volumeMl: newDrinkVolumeMl, alcoholContent: newDrinkAlcoholContent }
  addDrink(newDrink)
  newDrinkCountEl.value = '1'
  newDrinkNameEl.value = ''
  newDrinkVolumeMlEl.value = ''
  newDrinkAlcoholPercentageEl.value = ''
  newDrinkCountEl.focus()
})

clearListEl.addEventListener('click', () => {
  const shouldClearList = window.confirm('Är du säker på att du vill rensa listan?')
  if (shouldClearList === false) { return }
  for (let i = 0; i < drinks.length; i++) {
    removeRow(1)
  }
  drinks.splice(0,  drinks.length)
  updateTotalShots()
  updateLocalStorage()
})

function shotsInDrink (drink, opts = {}) {
  const strongLiquorAlcoholContent = 0.4
  const clPerShot = 4

  const count = opts.singleDrink ? 1 : drink.count
  const pureAlcoholMl = count * drink.volumeMl * drink.alcoholContent
  const pureAlcoholCl = pureAlcoholMl / 10
  const strongLiquorEquivalentCl = pureAlcoholCl / strongLiquorAlcoholContent
  const strongLiquorShotsEquivalent = strongLiquorEquivalentCl / clPerShot

  return strongLiquorShotsEquivalent
}

/**
 * @param {'count'|'name'|'volume'|'alcohol'} type
 */
function getEditElement (type) {
  const editElement = document.createElement('input')

  if (type === 'name') {
    editElement.type = 'text'
    editElement.classList.add('newDrinkName')
    return editElement
  }
  editElement.type = 'number'
  editElement.min = type === 'volume'
    ? '1'
    : '0'

  if (type === 'count') {
    editElement.step = 'any'
    editElement.classList.add('newDrinkCount')
  } else if (type === 'volume') {
    editElement.step = '1'
    editElement.classList.add('newDrinkVolumeMl')
  } else if (type === 'alcohol') {
    editElement.max = '100'
    editElement.step = '0.1'
    editElement.classList.add('newDrinkAlcoholPercentage')
  }

  return editElement
}

/**
 * @param {Drink} drink
 */
function addRow (drink) {
  const row = document.createElement('tr')
  const countTd = document.createElement('td')
  const nameTd = document.createElement('td')
  const volumeTd = document.createElement('td')
  const alcoholTd = document.createElement('td')
  const shotsTd = document.createElement('td')

  /**
   * @param {HTMLTableCellElement} el 
   * @param {'count'|'name'|'volume'|'alcohol'} type
   */
  function addEditListener (el, type, getEditValue, suffix = '', onEditComplete) {
    let editingCell = false
    el.addEventListener('click', () => {
      if (editingCell) { return }
      editingCell = true
      const oldValue = getEditValue()
      const editElement = getEditElement(type)
      el.replaceChildren(editElement)
      editElement.value = oldValue
      editElement.focus()

      editElement.addEventListener('focusout', () => {
        let rawNewValue = type === 'name'
          ? (editElement.value)
          : (editElement.valueAsNumber)
        if (rawNewValue == null || rawNewValue === '' || rawNewValue < 0) { rawNewValue = oldValue }
        const displayValue = rawNewValue.toLocaleString(siteLocale)
        el.replaceChildren(`${displayValue}${suffix}`)
        editingCell = false
        onEditComplete(rawNewValue)
        shotsTd.textContent = shotsInDrink(drink, { singleDrink: true }).toLocaleString(siteLocale, { maximumFractionDigits: 2 }) + '/st'
        updateTotalShots()
        updateLocalStorage()
      })
    })
  }

  addEditListener(countTd, 'count', () => parseFloat(countTd.innerText.replace(',', '.')), '', rawNewValue => {
    if (rawNewValue === 0) {
      const index = drinks.indexOf(drink)
      removeRow(index + 1)
      drinks.splice(index, 1)
      updateTotalShots()
      updateLocalStorage()
      return
    }
    drink.count = rawNewValue
  })
  addEditListener(nameTd, 'name', () => nameTd.innerText, '', rawNewValue => { drink.name = rawNewValue })
  addEditListener(volumeTd, 'volume', () => parseInt(volumeTd.innerText.substring(0, volumeTd.innerText.length - 2)), 'ml', rawNewValue => { drink.volumeMl = rawNewValue })
  addEditListener(alcoholTd, 'alcohol', () => parseFloat(alcoholTd.innerText.substring(0, alcoholTd.innerText.length - 1).replace(',', '.')), '%', rawNewValue => { drink.alcoholContent = rawNewValue / 100 })

  countTd.textContent = drink.count.toLocaleString(siteLocale)
  nameTd.textContent = drink.name
  volumeTd.textContent = `${drink.volumeMl}ml`
  alcoholTd.textContent = `${(drink.alcoholContent * 100).toLocaleString(siteLocale)}%`
  shotsTd.textContent = shotsInDrink(drink, { singleDrink: true }).toLocaleString(siteLocale, { maximumFractionDigits: 2 }) + '/st'

  row.append(countTd, nameTd, volumeTd, alcoholTd, shotsTd)
  drinksTableBody.append(row)
}

function removeRow (index) {
  const row = drinksTableBody.querySelector(`tr:nth-child(${index})`)
  row.remove()
}

function updateTotalShots () {
  shotsEl.textContent = drinks
    .map(drink => shotsInDrink(drink))
    .reduce((a, b) => a + b, 0)
    .toLocaleString(siteLocale, { maximumFractionDigits: 2 })
}

/**
 * @param {Drink} drink
 */
function addDrink (drink) {
  drinks.push(drink)
  updateTotalShots()
  addRow(drink)
  updateLocalStorage()
}

function updateLocalStorage () {
  const drinksAsJSON = JSON.stringify(drinks)
  localStorage.setItem(localStorageDrinksKey, drinksAsJSON)
}
