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

Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.nuts = {
    nutsActor,
    nutsItem,
    nutsRollDialog,
    rollBreatherDialog,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.NUTS = NUTS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.dex.mod",
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = nutsActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.nutsCharacter,
    npc: models.nutsNPC,
  };
  CONFIG.Item.documentClass = nutsItem;
  CONFIG.Item.dataModels = {
    item: models.nutsItem,
    shell: models.nutsShell,
    spell: models.nutsSpell,
  };

  registerSystemSettings();

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("nuts", nutsActorSheet, {
    makeDefault: true,
    label: "NUTS.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("nuts", nutsItemSheet, {
    makeDefault: true,
    label: "NUTS.SheetLabels.Item",
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("times", function (n, block) {
  var accum = "";
  for (var i = 0; i < n; ++i) accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper("hardHitting", function (key) {
  if (key === "hardHitting") {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper("above12", function (result) {
  if (parseInt(result) >= 12) {
    return true;
  } else {
    return false;
  }
});
Handlebars.registerHelper("below1", function (result) {
  if (parseInt(result) <= 1) {
    return true;
  } else {
    return false;
  }
});
Handlebars.registerHelper("everythingElse", function (result) {
  if (parseInt(result) != 1) {
    if (parseInt(result) !== 12) {
      return true;
    } else {
      return false;
    }
  }
});
Handlebars.registerHelper("getItemLocation", function (locations, location) {
  let textLocation = locations[location];
  return textLocation;
});

Handlebars.registerHelper(
  "detrimentsOverCD",
  function (detriments, cds, benefit) {
    let NewCDS = cds + benefit + 1;
    if (detriments < NewCDS) {
      return true;
    } else {
      return false;
    }
  }
);
Handlebars.registerHelper("checkValueOverZero", function (value) {
  if (value > 0) {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper("overTarget", function (target, dice) {
  if (parseInt(target) <= parseInt(dice)) {
    return true;
  } else {
    false;
  }
});

Handlebars.registerHelper("surgeOverFirst", function (surge) {
  const gameType = game.settings.get("nuts", "gameType");
  let newLevel = 0;
  if (gameType == "b") {
    if (surge == 1) {
      newLevel = 1;
    } else if (surge >= 2) {
      newLevel = 2;
    }
  }
  if (gameType == "c") {
    if (surge >= 3 && surge < 6) {
      newLevel = 1;
    } else if (surge >= 6) {
      newLevel = 2;
    }
  }
  if (newLevel >= 1) {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper("surgeOverSecond", function (surge) {
  const gameType = game.settings.get("nuts", "gameType");
  let newLevel = 0;
  if (gameType == "b") {
    if (surge == 1) {
      newLevel = 1;
    } else if (surge >= 2) {
      newLevel = 2;
    }
  }
  if (gameType == "c") {
    if (surge >= 3 && surge < 6) {
      newLevel = 1;
    } else if (surge >= 6) {
      newLevel = 2;
    }
  }
  if (newLevel >= 2) {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper(
  "surgeOptions",
  function (ones, twelves, rollType, shell) {
    if (shell === "surge") {
      if (rollType == "cdDef") {
        return false;
      }
      if (ones > 0) {
        return false;
      }
      if (twelves > 0) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }
);

Handlebars.registerHelper("summonCompanion", function (shell) {
  if (shell == "companionSummon") {
    return true;
  }
  return false;
});

Handlebars.registerHelper("protection", function (shell) {
  if (shell == "protection") {
    return true;
  }
  return false;
});

Handlebars.registerHelper("defRoll", function (type) {
  if (type == "cdDef") {
    return true;
  } else {
    return false;
  }
});

Handlebars.registerHelper("restDiceNumber", function (dice) {
  if (dice < 3) {
    return true;
  } else {
    return false;
  }
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

Hooks.on("renderChatMessage", function (message, html, messageData) {
  html.find(".rollAgainBtn").click((ev) => {
    console.log("Roll Again Button Clicked");
    const element = ev.currentTarget;
    const dataset = element.dataset;
    const target = dataset.target;
    const rollType = dataset.rolltype;
    const numdice = dataset.numdice;
    const actorId = dataset.actorId;
    const shell = dataset.shell;
    const actor = game.actors.get(actorId);
    const challengeDice = actor.system.challengeDice.value;
    const rollDialog = new game.nuts.nutsRollDialog(
      actor,
      challengeDice,
      "Challenge Roll",
      rollType,
      shell,
      numdice
    );
    rollDialog.render(true);
  });

  html.find(".surgeBtn").click(async (ev) => {
    const element = ev.currentTarget;
    const dataset = element.dataset;
    const choice = dataset.option;
    let chatObject = {
      choice,
    };
    let cardContent = await renderTemplate(
      "systems/nuts/templates/chat/surgeOptionChoice.hbs",
      chatObject
    );
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_STYLES.OTHER,
      content: cardContent,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flags: { "core.canPopout": true },
    };

    await ChatMessage.create(chatData);
  });
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
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
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
      type: "script",
      img: item.img,
      command: command,
      flags: { "nuts.itemMacro": true },
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
    type: "Item",
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

class rollBreatherDialog extends Application {
  constructor(actor) {
    super();
    this.actor = actor;
    this.dice = 0;
    this.challengeDice = 0;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["form"],
      height: 500,
      width: 400,
      popOut: true,
      template: "systems/nuts/templates/dialogs/breatherDialog.hbs",
      id: "breather-dialog",
      title: "take A Breather",
    });
  }
  getData() {
    return {
      actor: this.actor,
      dice: this.dice,
      challengeDice: this.challengeDice,
    };
  }
  activateListeners(html) {
    html.find(".giveBreathDice").click((ev) => this._addBreathDice(ev));
    html.find(".breathDice").click((ev) => this._removeBreathDice(ev));
    html.find(".rollBreather").click((ev) => this._rollBreather(ev));
  }
  _addBreathDice(ev) {
    this.challengeDice = this.challengeDice + 1;
    this.render();
  }
  _removeBreathDice(ev) {
    this.challengeDice = this.challengeDice - 1;
    this.render();
  }
  _rollBreather(ev) {
    let roll = this.actor.rollBreather(this.challengeDice);
    if (roll) {
      this.close();
    }
  }
}

class nutsRollDialog extends Application {
  constructor(actor, challengeDice, newTitle, rollType, shell, numDice) {
    super();
    this.actor = actor;
    this.challengeDice = challengeDice;
    this.dice = 0;
    this.newTitle = newTitle;
    this.detriment = 0;
    this.gameType = game.settings.get("nuts", "gameType");
    this.targets = actor.system.targets;
    this.benefit = 0;
    this.rollType = rollType;
    this.numDice = numDice;
    this.shell = shell;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["form"],
      height: 500,
      width: 400,
      popOut: true,
      template: "systems/nuts/templates/dialogs/rollDialog.hbs",
      id: "roll-dialog",
      title: this.newTitle,
    });
  }
  getData() {
    return {
      actor: this.actor,
      challengeDice: this.challengeDice,
      dice: this.dice,
      newTitle: this.newTitle,
      detriment: this.detriment,
      gameType: this.gameType,
      targets: this.targets,
      benefit: this.benefit,
      rollType: this.rollType,
      numDice: this.numDice,
      shell: this.shell,
    };
  }
  activateListeners(html) {
    html.find(".challengeDice").click((ev) => this._challengeDiceChange(ev));
    html
      .find(".giveBackChallengeDice")
      .click((ev) => this._giveBackChallengeDice(ev));
    html.find(".rollBtn").click((ev) => this._roll(ev));
    html.find(".removeDetriment").click((ev) => this._removeDetriments(ev));
    html.find(".addDetriment").click((ev) => this._addDetriments(ev));
    html.find(".addBenefit").click((ev) => this._addBenefit(ev));
    html.find(".removeBenefit").click((ev) => this._removeBenefit(ev));
    html.find(".shellBtn").click((ev) => this._useShell(ev));
    html.find(".targetSelect").change((ev) => {
      this._targetNumberSelect(ev);
    });
  }

  _challengeDiceChange(ev) {
    this.actor.update({
      "system.challengeDice.value": this.actor.system.challengeDice.value - 1,
    });
    this.challengeDice = this.challengeDice - 1;
    this.dice = this.dice + 1;
    this.render();
  }

  _addDetriments(ev) {
    this.detriment = this.detriment + 1;
    this.render();
  }
  _removeDetriments(ev) {
    this.detriment = this.detriment - 1;
    if (this.detriment < 0) {
      this.detriment = 0;
    }
    this.render();
  }

  _addBenefit(ev) {
    this.benefit = this.benefit + 1;
    this.render();
  }
  _removeBenefit(ev) {
    this.benefit = this.benefit - 1;
    if (this.benefit < 0) {
      this.benefit = 0;
    }
    this.render();
  }

  _giveBackChallengeDice(ev) {
    this.actor.update({
      "system.challengeDice.value": this.actor.system.challengeDice.value + 1,
    });
    this.challengeDice = this.challengeDice + 1;
    this.dice = this.dice - 1;
    this.render();
  }
  _roll(ev) {
    const element = ev.currentTarget;
    const dataset = element.dataset;
    const target = this.actor.system.target;
    let roll = this.actor.roll(this.dice, target, this.benefit, this.rollType);
    if (roll) {
      this.close();
    }
  }
  _useShell(ev) {
    ev.preventDefault();
    const element = ev.currentTarget;
    const dataset = element.dataset;
    const shell = dataset.shell;
    const target = this.actor.system.target;
    let dices = this.dice;
    let roll = this.actor.shellRoll(
      dices,
      target,
      this.benefit,
      this.rollType,
      shell,
      this.numDice
    );
    if (roll) {
      this.close();
    }
  }
  _targetNumberSelect(ev) {
    const element = ev.currentTarget;
    const value = element.value;
    this.actor.update({ "system.target": value });
  }
}

function registerSystemSettings() {
  game.settings.register("nuts", "gameType", {
    name: "Game Type",
    config: true,
    type: new foundry.data.fields.StringField({
      choices: {
        a: "Acorn",
        b: "Peanut",
        c: "Walnut",
      },
      initial: "b",
    }),
  });
  game.settings.register("nuts", "takeABreather", {
    name: "Take A Breather",
    config: true,
    type: new foundry.data.fields.NumberField({
      initial: 1,
    }),
  });
}