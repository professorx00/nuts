/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/nuts/templates/actor/parts/actor-shells.hbs',
    'systems/nuts/templates/actor/parts/actor-items.hbs',
    'systems/nuts/templates/actor/parts/actor-spells.hbs',
    'systems/nuts/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/nuts/templates/item/parts/item-effects.hbs',
  ]);
};
