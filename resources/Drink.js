export class Drink {
  /**
   * @param {string} name
   * @param {number} volumeMl
   * @param {number} alcoholContent
   * @param {{ name: string, volumeMl: number, alcoholContent: number }[]} ingredients
   */
  constructor (name, volumeMl, alcoholContent, ingredients) {
    this._name = name
    this._volumeMl = volumeMl
    this._alcoholContent = alcoholContent
    this._ingredients = ingredients
  }

  /**
   * @param {{ name: string, volumeMl: number, alcoholContent: number }} ingredient
   */
  addIngredient (ingredient) {
    this._ingredients.push(ingredient)
  }

  /**
   * @param {{ name: string, volumeMl: number, alcoholContent: number }} ingredient
   */
  removeIngredient (ingredient) {
    const index = this._ingredients.indexOf(ingredient)
    this._ingredients.splice(index, 1)
  }

  removeAllIngredients () {
    this._ingredients = []
  }

  get name () { return this._name }

  set name (value) { this._name = value }

  get volumeMl () {
    if (this.isMixedDrink === false) { return this._volumeMl }

    return this._ingredients.reduce((p, c) => p + c.volumeMl, 0)
  }

  set volumeMl (value) { this._volumeMl = value }

  get alcoholContent () {
    if (this.isMixedDrink === false) { return this._alcoholContent }

    return this._ingredients.reduce((p, c) => p + c.volumeMl * c.alcoholContent, 0) / this.volumeMl
  }

  set alcoholContent (value) { this._alcoholContent = value }

  get isMixedDrink () { return this._ingredients.length > 0 }

  get pureAlcoholMl () { return this.volumeMl * this.alcoholContent }
}
