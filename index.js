import { Drink } from './resources/Drink.js'

/** @type {HTMLSpanElement} */
const shotsElement = document.getElementById('shots')
/** @type {HTMLTableSectionElement} */
const drinkRowsElement = document.querySelector('.drinkTable .drink-rows')

/** @type {HTMLButtonElement} */
const addNewDrinkButtonElement = document.querySelector('.actionButton.newDrink')
/** @type {HTMLButtonElement} */
const clearListElement = document.querySelector('.actionButton.clearList')
/** @type {HTMLDialogElement} */
const editDrinkDialogElement = document.getElementById('edit-drink-dialog')

/** @type {HTMLInputElement} */
const drinkNameElement = editDrinkDialogElement.querySelector('.name')
/** @type {HTMLInputElement} */
const drinkVolumeElement = editDrinkDialogElement.querySelector('.volume')
/** @type {HTMLInputElement} */
const drinkAlcoholPercentageElement = editDrinkDialogElement.querySelector('.alcohol-percentage')
/** @type {HTMLInputElement} */
const isMixedDrinkElement = editDrinkDialogElement.querySelector('.is-mixed-drink')

/** @type {HTMLDivElement} */
const ingredientsSectionElement = editDrinkDialogElement.querySelector('.ingredients-section')

/** @type {HTMLTableSectionElement} */
const ingredientRowsElement = editDrinkDialogElement.querySelector('.ingredient-rows')

/** @type {HTMLInputElement} */
const editNewIngredientNameElement = editDrinkDialogElement.querySelector('.edit-new-ingredient .name')
/** @type {HTMLInputElement} */
const editNewIngredientVolumeElement = editDrinkDialogElement.querySelector('.edit-new-ingredient .volume')
/** @type {HTMLInputElement} */
const editNewIngredientAlcoholPercentageElement = editDrinkDialogElement.querySelector('.edit-new-ingredient .alcohol-percentage')
/** @type {HTMLButtonElement} */
const editNewIngredientAddElement = editDrinkDialogElement.querySelector('.edit-new-ingredient .add')

/** @type {HTMLButtonElement} */
const drinkConfirmElement = editDrinkDialogElement.querySelector('.confirm')

/** @type {HTMLTemplateElement} */
const ingredientRowTemplateElement = document.getElementById('ingredient-row-template')
/** @type {HTMLTemplateElement} */
const drinkRowTemplateElement = document.getElementById('drink-row-template')

// How many ml of pure alchol one shot of 40% liquor contains
const oneShotInPureAlcoholMl = 0.4 * 40
const siteLocale = 'sv-SE'
const drinkLogLocalStorageKey = 'alko-logg_drinkLog'
let drinkLog = (JSON.parse(localStorage.getItem(drinkLogLocalStorageKey)) || []).map(({ date, drink }) => ({
  date: new Date(date),
  drink: new Drink(drink._name, drink._volumeMl, drink._alcoholContent, drink._ingredients)
}))
let editDrink = new Drink(null, null, null, [])
let editLogEntry = null

for (const drinkLogEntry of drinkLog) {
  addDrinkLogRow(drinkLogEntry)
}
updateTotalShots()

addNewDrinkButtonElement.addEventListener('click', () => {
  editDrinkDialogElement.showModal()
  resetEditDrink()
})

clearListElement.addEventListener('click', () => {
  const shouldClearList = window.confirm('Är du säker på att du vill rensa loggen?')
  if (shouldClearList === false) { return }

  drinkLog = []
  drinkRowsElement.innerHTML = ''
  updateTotalShots()
})

editDrinkDialogElement.addEventListener('close', () => {
  editLogEntry = null
})

function resetEditDrink() {
  editDrink = new Drink(null, null, null, [])

  drinkNameElement.value = ''
  drinkVolumeElement.value = ''
  drinkVolumeElement.readOnly = false
  drinkAlcoholPercentageElement.value = ''
  drinkAlcoholPercentageElement.readOnly = false
  isMixedDrinkElement.checked = false
  
  ingredientsSectionElement.classList.add('hide')
  ingredientRowsElement.innerHTML = ''
}

drinkNameElement.addEventListener('change', () => {
  const name = drinkNameElement.value
  if (name.trim() === '') {
    drinkNameElement.value = editDrink.name
    return window.alert('Drycknamn får ej vara tomt')
  }

  editDrink.name = name
})

drinkVolumeElement.addEventListener('change', () => {
  const volume = drinkVolumeElement.valueAsNumber
  if (isNaN(volume) || volume > 0 === false) {
    drinkVolumeElement.value = editDrink.volumeMl
    return window.alert('Dryckvolym måste vara ett giltigt tal som är större än 0')
  }

  editDrink.volumeMl = volume
})

drinkAlcoholPercentageElement.addEventListener('change', () => {
  const alcoholPercentage = drinkAlcoholPercentageElement.valueAsNumber
  if (isNaN(alcoholPercentage) || alcoholPercentage < 0 || alcoholPercentage > 100) {
    drinkAlcoholPercentageElement.value = (editDrink.alcoholContent * 100).toFixed(1)
    return window.alert('Dryckalkoholhalt måste vara ett giltigt tal mellan 0 och 100')
  }

  editDrink.alcoholContent = alcoholPercentage / 100
})

isMixedDrinkElement.addEventListener('change', () => {
  if (isMixedDrinkElement.checked) {
    ingredientsSectionElement.classList.remove('hide')
    drinkVolumeElement.readOnly = true
    drinkAlcoholPercentageElement.readOnly = true
    editNewIngredientNameElement.focus()
  } else {
    editDrink.removeAllIngredients()
    ingredientRowsElement.innerHTML = ''
    ingredientsSectionElement.classList.add('hide')
    drinkVolumeElement.readOnly = false
    drinkAlcoholPercentageElement.readOnly = false
  }
  drinkVolumeElement.value = ''
  editDrink.volumeMl = null
  drinkAlcoholPercentageElement.value = ''
  editDrink.alcoholContent = null
})

editNewIngredientAddElement.addEventListener('click', () => {
  const name = editNewIngredientNameElement.value
  const volume = editNewIngredientVolumeElement.valueAsNumber
  const alcoholPercentage = editNewIngredientAlcoholPercentageElement.valueAsNumber

  // Validation
  if (name.trim() === '') { return window.alert('Ingrediensnamn får ej vara tomt') }
  if (isNaN(volume) || volume > 0 === false) { return window.alert('Ingrediensvolym måste vara ett giltigt tal som är större än 0') }
  if (isNaN(alcoholPercentage) || alcoholPercentage < 0 || alcoholPercentage > 100) { return window.alert('Ingrediensalkoholhalt måste vara ett giltigt tal mellan 0 och 100') }
  
  const ingredient = {
    name,
    volumeMl: volume,
    alcoholContent: alcoholPercentage / 100
  }
  addNewIngredientRow(ingredient)
  editDrink.addIngredient(ingredient)
  updateEditSummary()

  // Reset the inputs
  editNewIngredientNameElement.value = ''
  editNewIngredientVolumeElement.value = ''
  editNewIngredientAlcoholPercentageElement.value = ''
  editNewIngredientNameElement.focus()
})

drinkConfirmElement.addEventListener('click', e => {
  e.preventDefault()

  const { name, volumeMl, alcoholContent } = editDrink
  if (name == null || name.trim() === '') { return window.alert('Drycknamn får ej vara tomt') }
  if (volumeMl == null || volumeMl > 0 === false) { return window.alert('Dryckvolym måste vara ett giltigt tal som är större än 0') }
  if (alcoholContent == null || alcoholContent < 0 || alcoholContent > 1) { return window.alert('Dryckalkoholhalt måste vara ett giltigt tal mellan 0 och 100') }

  if (editLogEntry == null) {
    addNewDrink(editDrink)
  } else {
    updateDrinkLogEntry(editLogEntry)
  }

  editDrinkDialogElement.close('success')
})

function addNewIngredientRow (ingredient) {
  const { name, volumeMl, alcoholContent } = ingredient
  const newRow = ingredientRowTemplateElement.content.cloneNode(true)
  
  /** @type {HTMLInputElement} */
  const nameElement = newRow.querySelector('.name')
  /** @type {HTMLInputElement} */
  const volumeElement = newRow.querySelector('.volume')
  /** @type {HTMLInputElement} */
  const alcoholPercentageElement = newRow.querySelector('.alcohol-percentage')
  /** @type {HTMLButtonElement} */
  const removeButtonElement = newRow.querySelector('.remove')

  ingredientRowsElement.append(newRow)

  nameElement.value = name
  volumeElement.value = volumeMl
  alcoholPercentageElement.value = (alcoholContent * 100).toFixed(1)
  
  nameElement.addEventListener('change', () => {
    if (nameElement.value.trim() === '') {
      nameElement.value = ingredient.name
      return window.alert('Ingrediensnamn får ej vara tomt')
    }

    ingredient.name = nameElement.value
  })

  volumeElement.addEventListener('change', () => {
    if (isNaN(volumeElement.valueAsNumber) || volumeElement.valueAsNumber > 0 === false) {
      volumeElement.value = ingredient.volumeMl
      return window.alert('Ingrediensvolym måste vara ett giltigt tal som är större än 0')
    }

    ingredient.volumeMl = volumeElement.valueAsNumber
    updateEditSummary()
  })

  alcoholPercentageElement.addEventListener('change', () => {
    if (isNaN(alcoholPercentageElement.valueAsNumber) || alcoholPercentageElement.valueAsNumber < 0 || alcoholPercentageElement.valueAsNumber > 100) {
      alcoholPercentageElement.value = (ingredient.alcoholContent * 100).toFixed(1)
      return window.alert('Ingrediensalkoholhalt måste vara ett giltigt tal mellan 0 och 100')
    }

    ingredient.alcoholContent = alcoholPercentageElement.valueAsNumber / 100
    updateEditSummary()
  })

  removeButtonElement.addEventListener('click', () => {
    /** @type {HTMLTableRowElement} */
    const row = removeButtonElement.closest('tr')
    row.remove()
    editDrink.removeIngredient(ingredient)

    updateEditSummary()
  })
}

function addNewDrink (drink) {
  const drinkLogEntry = {
    date: new Date(),
    drink
  }
  drinkLog.push(drinkLogEntry)
  addDrinkLogRow(drinkLogEntry)
  updateTotalShots()
}

function updateDrinkLogEntry (drinkLogEntry) {
  drinkLogEntry.drink._name = editDrink._name
  drinkLogEntry.drink._volumeMl = editDrink._volumeMl
  drinkLogEntry.drink._alcoholContent = editDrink._alcoholContent
  drinkLogEntry.drink._ingredients = editDrink._ingredients

  const index = drinkLog.indexOf(drinkLogEntry)
  const row = drinkRowsElement.querySelector(`.drink-row:nth-child(${index + 1})`)

  const nameElement = row.querySelector('.name')
  const shotsElement = row.querySelector('.shots')

  nameElement.textContent = editDrink.name
  shotsElement.textContent = (editDrink.pureAlcoholMl / oneShotInPureAlcoholMl).toLocaleString(siteLocale, { maximumFractionDigits: 2 })

  updateTotalShots()
}

function addDrinkLogRow (drinkLogEntry) {
  const { date, drink } = drinkLogEntry

  const row = drinkRowTemplateElement.content.cloneNode(true)
  const nameElement = row.querySelector('.name')
  const timeElement = row.querySelector('.time')
  const shotsElement = row.querySelector('.shots')
  const duplicateElement = row.querySelector('.duplicate')
  const removeElement = row.querySelector('.remove')

  drinkRowsElement.append(row)

  nameElement.textContent = drink.name
  timeElement.textContent = date.toLocaleTimeString(siteLocale)
  shotsElement.textContent = (drink.pureAlcoholMl / oneShotInPureAlcoholMl).toLocaleString(siteLocale, { maximumFractionDigits: 2 })

  nameElement.addEventListener('click', () => {
    editLogEntry = drinkLogEntry
    editDrinkDialogElement.showModal()
    fillEditWithDrink(drinkLogEntry.drink)
  })

  duplicateElement.addEventListener('click', () => {
    addNewDrink(new Drink(drink._name, drink._volumeMl, drink._alcoholContent, deepCopy(drink._ingredients)))
  })

  removeElement.addEventListener('click', () => {
    const confirm = window.confirm(`Är du säker på att du vill ta bort "${drink.name}" från ${date.toLocaleTimeString(siteLocale)}?`)
    if (confirm === false) { return }

    removeElement.closest('tr').remove()
    const index = drinkLog.indexOf(drinkLogEntry)
    drinkLog.splice(index, 1)
    updateTotalShots()
  })
}

/**
 * @param {Drink} drink
 */
function fillEditWithDrink (drink) {
  resetEditDrink()
  editDrink = new Drink(drink._name, drink._volumeMl, drink._alcoholContent, deepCopy(drink._ingredients))

  drinkNameElement.value = editDrink.name
  if (editDrink.isMixedDrink) {
    drinkVolumeElement.readOnly = true
    drinkAlcoholPercentageElement.readOnly = true
    isMixedDrinkElement.checked = true
    ingredientsSectionElement.classList.remove('hide')

    for (const ingredient of editDrink._ingredients) {
      addNewIngredientRow(ingredient)
    }
    updateEditSummary()
  } else {
    drinkVolumeElement.value = editDrink.volumeMl
    drinkAlcoholPercentageElement.value = editDrink.alcoholContent * 100
  }
}

function deepCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function updateEditSummary () {
  drinkVolumeElement.value = editDrink.volumeMl
  drinkAlcoholPercentageElement.value = (editDrink.alcoholContent * 100).toFixed(1)
}

function updateTotalShots () {
  const totalPureAlcoholMl = drinkLog.reduce((p, c) => p + c.drink.pureAlcoholMl, 0)
  shotsElement.textContent = (totalPureAlcoholMl / oneShotInPureAlcoholMl).toLocaleString(siteLocale, { maximumFractionDigits: 2 })

  localStorage.setItem(drinkLogLocalStorageKey, JSON.stringify(drinkLog))
}
