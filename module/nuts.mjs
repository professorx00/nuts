// Import document classes.
import { nutsActor } from './documents/actor.mjs';
import { nutsItem } from './documents/item.mjs';
// Import sheet classes.
import { nutsActorSheet } from './sheets/actor-sheet.mjs';
import { nutsItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { NUTS } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.nuts = {
    nutsActor,
    nutsItem,
    nutsRollDialog,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.NUTS = NUTS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = nutsActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.nutsCharacter,
    npc: models.nutsNPC
  }
  CONFIG.Item.documentClass = nutsItem;
  CONFIG.Item.dataModels = {
    item: models.nutsItem,
    shell: models.nutsShell,
    spell: models.nutsSpell
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('nuts', nutsActorSheet, {
    makeDefault: true,
    label: 'NUTS.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('nuts', nutsItemSheet, {
    makeDefault: true,
    label: 'NUTS.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("times", function (n, block) {
  var accum = "";
  for (var i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.nuts.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'nuts.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

class nutsRollDialog extends Application {
   constructor(actor, challengeDice, newTitle) {
    console.log("Before",newTitle)
    super();
    this.actor = actor;
    this.challengeDice = challengeDice
    this.dice = 0
    this.newTitle = newTitle
    this.detriment = false;
   }
   static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["form"],
      height: 400,
      width: 400,
      popOut: true,
      template: 'systems/nuts/templates/dialogs/rollDialog.hbs',
      id:"roll-dialog",
      title: this.newTitle
    })
   }
   getData(){
    return{
      actor: this.actor,
      challengeDice: this.challengeDice,
      dice: this.dice,
      newTitle: this.newTitle,
      detriment: this.detriment
    }
   }
   activateListeners(html) {
    html.find(".challengeDice").click((ev) => this._challengeDiceChange(ev));
    html
      .find(".giveBackChallengeDice")
      .click((ev) => this._giveBackChallengeDice(ev));
    html
      .find(".rollBtn")
      .click((ev) => this._roll(ev));

    html.find(".hasDetriment").click((ev) => {
      console.log("detriment")
      this.detriment = !this.detriment;
      this.render();
    });
   }

   _challengeDiceChange(ev){
      this.actor.update({"system.challengeDice.value": this.actor.system.challengeDice.value - 1})
      this.challengeDice = this.challengeDice -1
      this.dice = this.dice + 1
      this.render();
   }
   _giveBackChallengeDice(ev){
    this.actor.update({
      "system.challengeDice.value": this.actor.system.challengeDice.value + 1,
    });
    this.challengeDice = this.challengeDice + 1;
    this.dice = this.dice - 1;
    this.render();
   }
   _roll(ev){
    console.log("before Roll", this.dice)
    let roll = this.actor.roll(this.dice, this.detriment)
    if(roll){
      this.close()
    }
   }
}