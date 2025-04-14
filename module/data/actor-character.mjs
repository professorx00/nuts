import nutsActorBase from "./base-actor.mjs";

export default class nutsCharacter extends nutsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    schema.shellLevels = new fields.SchemaField({
      0: new fields.StringField({ initial: "Locked" }),
      1: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      2: new fields.NumberField({ ...requiredInteger, initial: 2 }),
      3: new fields.NumberField({ ...requiredInteger, initial: 3 }),
      4: new fields.NumberField({ ...requiredInteger, initial: 4 }),
      5: new fields.NumberField({ ...requiredInteger, initial: 5 }),
      6: new fields.NumberField({ ...requiredInteger, initial: 6 }),
    });

    schema.surgeOptionsList = new fields.SchemaField({
      a: new fields.StringField({
        initial: "Damage an adjacent enemy for 1 HP.",
      }),
      b: new fields.StringField({ initial: "Attack hits for +1 damage." }),
      c: new fields.StringField({
        initial: "Next player to attack target has guaranteed critical on hit.",
      }),
      d: new fields.StringField({
        initial: "Next player to attack target has a guaranteed hit.",
      }),
      e: new fields.StringField({
        initial: "Adds +1 Benefit to next Player defending against target.",
      }),
      f: new fields.StringField({
        initial: "You and all other players receive +1 Challenge Die.",
      }),
    });

    schema.surgeOptionFirst = new fields.StringField({
      initial: "a",
    });
    schema.surgeOptionSecond = new fields.StringField({
      initial: "b",
    });

    schema.companionSummon = new fields.BooleanField({
      initial: false,
    });
    schema.shifting = new fields.BooleanField({
      initial: false,
    });

    schema.targets = new fields.SchemaField({
      1: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      2: new fields.NumberField({ ...requiredInteger, initial: 2 }),
      3: new fields.NumberField({ ...requiredInteger, initial: 3 }),
      4: new fields.NumberField({ ...requiredInteger, initial: 4 }),
      5: new fields.NumberField({ ...requiredInteger, initial: 5 }),
      6: new fields.NumberField({ ...requiredInteger, initial: 6 }),
      7: new fields.NumberField({ ...requiredInteger, initial: 7 }),
      8: new fields.NumberField({ ...requiredInteger, initial: 8 }),
      9: new fields.NumberField({ ...requiredInteger, initial: 9 }),
      10: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      11: new fields.NumberField({ ...requiredInteger, initial: 11 }),
      12: new fields.NumberField({ ...requiredInteger, initial: 12 }),
    });

    schema.target = new fields.NumberField({ ...requiredInteger, initial: 6 });
    schema.safetyNet = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.hardHitting = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.defensive = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.comboMaker = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.surge = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.protection = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.itemEater = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.crafter = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.durability = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.endurance = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.lucky = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.shift = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });
    schema.companion = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });    
    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.NUTS.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.NUTS.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};
    return data
  }
}