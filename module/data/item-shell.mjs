import nutsItemBase from "./base-item.mjs";

export default class nutsShell extends nutsItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.levels = new fields.SchemaField({
      locked: new fields.StringField({ initial: "Locked" }),
      level1: new fields.StringField({ initial: "Level 1" }),
      level2: new fields.StringField({ initial: "Level 2" }),
      level3: new fields.StringField({ initial: "Level 3" }),
      level4: new fields.StringField({ initial: "Level 4" }),
      level5: new fields.StringField({ initial: "Level 5" }),
      level6: new fields.StringField({ initial: "Level 6" }),
    });
    schema.level = new fields.StringField({ initial: "Locked" });
    return schema;
  }
}