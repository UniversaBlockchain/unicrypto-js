const Formatter = require('./formatter');
const Parser = require('./parser');
const _ = require('../vendor/lodash.custom');

const registry = {
  serializers: {},
  constructors: {},
  register: function(alias, bossSerializable) {
    const deserializeBOSS = bossSerializable.deserializeFromBOSS;
    const name = bossSerializable.className;

    if (!deserializeBOSS)
      throw new Error(`Failed to register BOSS type ${alias}: deserializeFromBOSS not found`);

    if (!name)
      throw new Error(`Failed to register BOSS type ${alias}: className not found`);

    if (!this.serializers[name]) {
      let serializer;
      let serializeBOSS = bossSerializable.serializeToBOSS;

      if (serializeBOSS)
        serializer = (instance) => serializeBOSS(instance);
      else
        serializer = (instance) => instance.serializeToBOSS();

      this.serializers[name] = {
        aliases: [alias],
        serialize: serializer
      };
    } else {
      if (this.serializers[name].aliases.indexOf(alias) === -1)
        this.serializers[name].aliases.push(alias);
    }

    this.constructors[alias] = (serialized) => deserializeBOSS(serialized);
  },
  serialize: function(constructorName, instance) {
    const serializer = this.serializers[constructorName];

    if (!serializer) return;
    const serialized = serializer.serialize(instance);

    serialized['__type'] = serializer.aliases[0];

    return serialized;
  },
  deserialize: function(dict) {
    const type = dict['__type'] || dict['__t'];

    if (!type) return;

    const construct = this.constructors[type];

    if (!construct) {
      return dict;
      // FIXME: should support unknown classes?
      // throw new Error(`Unknown BOSS deserialize type: ${type}`);
    }

    return construct(dict);
  }
};

class Reader {
  constructor(stream) { this.parser = new Parser(registry, stream); }
  read() { return this.parser.get(); }
}

class Writer {
  constructor() { this.formatter = new Formatter(registry); }
  write(arg) { this.formatter.put(arg); }
  get() { return this.formatter.toArray(); }
}

/**
 * Instantiates Formatter class and returns encoded string
 *
 * @param  {...*} args
 *
 * @return {String}
 */
function dump(...args) {
  const formatter = new Formatter(registry);

  for (const arg of args) formatter.put(_.cloneDeep(arg));

  return formatter.toArray(); // TODO: Should rename method
}

/**
 * Instantiates Parser class and returns decoded value
 *
 * @param  {String}
 * @return {Array}
 */
function load(source) {
  const parser = new Parser(registry, source);

  return parser.get();
}

const Protocol = {
  load,
  dump,
  pack: dump,
  unpack: load,

  /**
   * Instantiates Parser class and decodes all passed source.
   *
   * @param  {String}
   * @return {Array}
   */
  loadAll: function(source) {
    const parser = new Parser(registry, source);
    const result = [];

    var value;

    while (value = parser.get()) result.push(value);

    return result;
  },

  Writer,
  Reader,
  register: (alias, bossSerializable) => {
    registry.register(alias, bossSerializable);
  }
};

module.exports = Protocol;
