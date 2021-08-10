export function encode64(data: Uint8Array): string;
  export function encode64Short(data: Uint8Array): string;
  export function decode64(encoded: string): Uint8Array;
  export function decode64Short(encoded: string): Uint8Array;
  export function encode58(data: Uint8Array): string;
  export function decode58(encoded: string): Uint8Array;
  export function bytesToText(text: Uint8Array): string;
  export function textToBytes(text: string): Uint8Array;
  export function hexToBytes(hexstring: string): Uint8Array;
  export function bytesToHex(bytes: Uint8Array): string;
  export function hashId(data: Uint8Array): Promise<Uint8Array>;
  export function randomBytes(size: number): Uint8Array;
  export function crc32(data: Uint8Array): Uint8Array;
  export function shortId(): string;
  export function isBrowser(): boolean;
  export function isNode(): boolean;
  export function isWorker(): boolean;

  export interface CreateKeysOpts {
    strength?: number
  }

  export interface PBKDF2Opts {
    password: string | Uint8Array,
    salt?: string | Uint8Array,
    rounds?: number,
    keyLength?: number
  }

  export function pbkdf2(sha: SHAStringType, options: PBKDF2Opts): Promise<Uint8Array>;

  export class BigInteger {
    constructor(value: any, encoding: any);
  }

  export class DiffieHellman {
    secret: string | null;
    publicKey: string | null;
    prime: string;
    generator: string;

    constructor(prime: string, generator?: string);

    generateKeys(): string;
    computeSecret(publicKey: string): string;

    static generate(primeLength: number, generator?: number): DiffieHellman;
  }

  export class KeyAddress {
    constructor(source: Uint8Array | string);

    readonly bytes: Uint8Array;
    readonly base58: string;
    readonly asBinary: Uint8Array;
    readonly asString: string;

    static checkAddress(source: Uint8Array | string): boolean;

    isValid: boolean;
    isLong: boolean;
  }

  export class SHA {
    constructor(size: SHAStringType | number);

    get(encoding?: string): Promise<Uint8Array>;
    get(data?: Uint8Array, encoding?: string): Promise<Uint8Array>;
    getSync(encoding?: string): Uint8Array;
    getSync(data?: Uint8Array, encoding?: string): Uint8Array;
    put(data: Uint8Array): Promise<void>;
    putSync(data: Uint8Array): void;
    delete(): Promise<void>;

    static getDigest(sha: SHAStringType, data: Uint8Array): Promise<Uint8Array>;
    static getDigestSync(sha: SHAStringType, data: Uint8Array): Uint8Array;
  }

  export class HMAC {
    constructor(sha: SHAStringType, key: Uint8Array);

    get(data?: Uint8Array): Promise<Uint8Array>;
    getSync(data?: Uint8Array): Uint8Array;
  }

  export class AbstractKey {
    static readonly TYPE_PRIVATE: number;
    static readonly TYPE_PUBLIC: number;
    static readonly TYPE_PRIVATE_PASSWORD: number;
    static readonly TYPE_PRIVATE_PASSWORD_V2: number;
    static readonly FINGERPRINT_SHA256: number;
    static readonly FINGERPRINT_SHA384: number;

    static typeOf(key: Uint8Array): number;
  }

  export type SHAStringType = "sha1" | "sha256" | "sha384" | "sha512" | "sha512/256" | "sha3_256" | "sha3_384" | "sha3_512";

  export interface PrivateKeyUnpackBOSS {
    bin: Uint8Array,
    password: string
  }

  export interface PrivateKeyPackBOSS {
    rounds?: number,
    password: string
  }

  export interface PrivateKeySignOpts {
    pssHash?: SHA | HMAC | SHAStringType,
    mgf1Hash?: SHA | HMAC | SHAStringType,
    oaepHash?: SHA | HMAC | SHAStringType,
    salt?: string | Uint8Array,
    saltLength?: number,
    seed?: string | Uint8Array
  }

  export class PrivateKey {
    public publicKey: PublicKey;

    delete(): void;
    pack(options?: string | PrivateKeyPackBOSS): Promise<Uint8Array>;
    sign(data: Uint8Array, options: PrivateKeySignOpts): Promise<Uint8Array>;
    signExtended(data: Uint8Array): Promise<Uint8Array>;
    decrypt(data: Uint8Array, options?: PublicKeyEncryptOpts): Promise<Uint8Array>;

    static unpack(packed: Uint8Array, password?: string): Promise<PrivateKey>;
    static unpack(options: PrivateKeyUnpackBOSS): Promise<PrivateKey>;
    static generate(options: CreateKeysOpts): Promise<PrivateKey>;
  }

  export interface PublicKeyEncryptOpts {
    pssHash?: SHA | HMAC | SHAStringType,
    mgf1Hash?: SHA | HMAC | SHAStringType,
    oaepHash?: SHA | HMAC | SHAStringType,
    salt?: string | Uint8Array,
    saltLength?: number,
    seed?: string | Uint8Array
  }

  export interface AddressOpts {
    long?: boolean,
    typeMark?: number
  }

  export class PublicKey {
    readonly shortAddress: KeyAddress;
    readonly longAddress: KeyAddress;
    readonly shortAddress58: string;
    readonly longAddress58: string;
    readonly fingerprint: Uint8Array;
    readonly packed: Uint8Array;

    delete(): void;
    getBitStrength(): number;
    encryptionMaxLength(options?: PublicKeyEncryptOpts): number;
    pack(mode?: string): Promise<Uint8Array>;
    verify(
      message: Uint8Array,
      signature: Uint8Array,
      options: PrivateKeySignOpts
    ): Promise<boolean>;
    verifyExtended(signature: Uint8Array, message: Uint8Array): Promise<any>;
    encrypt(data: Uint8Array, options?: PublicKeyEncryptOpts): Promise<Uint8Array>;

    static unpack(packed: Uint8Array): Promise<PublicKey>;
    static isValidAddress(address: Uint8Array | string): boolean;
    static readonly DEFAULT_OAEP_HASH: SHA;
    static readonly DEFAULT_MGF1_HASH: SHA;
  }

  export interface BossDeserializable<T> {
    deserializeFromBOSS(params: any): T,
    className: string
  };

  export interface BossSerializable {
    serializeToBOSS(): any
  };

  type WorkerFn = (resolve: any, reject: any) => void;

  export namespace CryptoWorker {
    export function run(fn: string | WorkerFn, options: any): Promise<any>;
  };

  export namespace Boss {
    export function dump(data: any): Uint8Array;
    export function load(packed: Uint8Array): any;

    export class Writer {
      constructor();

      write(data: any): void;
      get(): Uint8Array;
    }

    export class Reader {
      constructor(data: Uint8Array);

      read(): any;
    }

    export function register<T extends BossSerializable>(alias: string, clz: BossDeserializable<T>): void;
    export function registerSerializer<T>(alias: string, clz: BossDeserializable<T>, serializer: (any) => T): void;
  }

  export class SignedRecord {
    constructor(recordType: number, key: PrivateKey, payload: any, nonce?: Uint8Array);

    public recordType: number;
    public key: PublicKey;
    public payload: any;
    public nonce: Uint8Array | null;

    static readonly RECORD_WITH_KEY: number;
    static readonly RECORD_WITH_ADDRESS: number;

    static packWithKey(key: PrivateKey, payload: any, nonce?: Uint8Array): Promise<Uint8Array>;
    static unpack(packed: Uint8Array): Promise<SignedRecord>;
  }

  export interface KeyInfoOpts {
    algorithm: number;
    tag?: Uint8Array;
    keyLength?: number;
    prf?: number;
    rounds?: number;
    salt?: Uint8Array;
  }

  export interface PRFType {
    None: number;
    HMAC_SHA1: number;
    HMAC_SHA256: number;
    HMAC_SHA512: number;
  }

  export interface AlgorithmType {
    UNKNOWN: number;
    RSAPublic: number;
    RSAPrivate: number;
    AES256: number;
  }

  export class KeyInfo {
    constructor(params: KeyInfoOpts);

    static readonly PRF: PRFType;
    static readonly Algorithm: AlgorithmType;

    pack(): Uint8Array;
    matchType(other: KeyInfo): boolean;
    derivePassword(password: string): Promise<Uint8Array>;

    static unpack(packed: Uint8Array): KeyInfo;
  }

  export interface SymmetricKeyOpts {
    keyBytes?: Uint8Array,
    keyInfo?: KeyInfo
  }

  export class SymmetricKey {
    constructor(options?: SymmetricKeyOpts);

    pack(): Uint8Array;
    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
    etaEncrypt(data: Uint8Array): Promise<Uint8Array>;
    etaDecrypt(data: Uint8Array): Promise<Uint8Array>;
    etaEncryptSync(data: Uint8Array): Uint8Array;
    etaDecryptSync(data: Uint8Array): Uint8Array;

    static fromPassword(password: string, rounds: number, salt?: Uint8Array): Promise<SymmetricKey>;
  }

  export class AES {
    constructor(key: Uint8Array);

    encrypt(data: Uint8Array): Uint8Array;
    decrypt(data: Uint8Array): Uint8Array;
  }

  let unicryptoReady: Promise<boolean>;

