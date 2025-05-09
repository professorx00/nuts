import nutsItemBase from "./base-item.mjs";

export default class nutsItem extends nutsItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d12" }),
      diceBonus: new fields.StringField({ initial: "" })
    });

    schema.itemLocation = new fields.SchemaField({
      backpack: new fields.StringField({ initial: "Backpack Slot" }),
      tools: new fields.StringField({ initial: "Tool Slot" }),
      weapon: new fields.StringField({ initial: "Weapon Slot" }),
      itemEater: new fields.StringField({ initial: "Item Eater Slot" }),
    });

    schema.location = new fields.StringField({ initial: "backpack" });

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const roll = this.roll;
    this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
}