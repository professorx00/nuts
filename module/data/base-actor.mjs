import nutsDataModel from "./base-model.mjs";

export default class nutsActorBase extends nutsDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 3 })
    });
    schema.challengeDice = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 6, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 6 }),
    });
    schema.monies = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0
      }),
    });
    schema.nature = new fields.StringField({ required: true, blank: true });
    schema.utility = new fields.StringField({ required: true, blank: true });
    schema.tale = new fields.StringField({required: true, blank: true});

    return schema;
  }

}