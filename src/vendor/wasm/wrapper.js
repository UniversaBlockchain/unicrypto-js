var Module = typeof Module !== "undefined" ? Module : {};

function _init() {
  if (Module._initialized) return;
  Module._initialized = true;

  var moduleOverrides = {};
  var key;
  for (key in Module) {
      if (Module.hasOwnProperty(key)) {
          moduleOverrides[key] = Module[key]
      }
  }
  var arguments_ = [];
  var thisProgram = "./this.program";
  var quit_ = function(status, toThrow) {
      throw toThrow
  };
  var ENVIRONMENT_IS_WEB = false;
  var ENVIRONMENT_IS_WORKER = false;
  var ENVIRONMENT_IS_NODE = false;
  var ENVIRONMENT_IS_SHELL = false;
  ENVIRONMENT_IS_WEB = typeof window === "object";
  ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
  ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
  ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
  var scriptDirectory = "";
  var PACKAGE_VERSION = "1.12.0";

  if (typeof LIBRARY_PATH !== 'undefined' && !Module.libraryPath) Module.libraryPath = LIBRARY_PATH;

  function locateFile(path) {
      if (Module["locateFile"]) {
          return Module["locateFile"](path, scriptDirectory)
      }

      if (Module.libraryPath) {
        if (Module.libraryPath[Module.libraryPath.length - 1] !== '/')
          Module.libraryPath += '/';

      console.log('locate crypto file', Module.libraryPath, path);

        return Module.libraryPath + path;
      }

      return scriptDirectory + path
  }
  var read_, readAsync, readBinary, setWindowTitle;
  var nodeFS;
  var nodePath;
  if (ENVIRONMENT_IS_NODE) {
      if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = require("path").dirname(scriptDirectory) + "/"
      } else {
          scriptDirectory = __dirname + "/"
      }
      read_ = function shell_read(filename, binary) {
          if (!nodeFS) nodeFS = require("fs");
          if (!nodePath) nodePath = require("path");
          filename = nodePath["normalize"](filename);
          return nodeFS["readFileSync"](filename, binary ? null : "utf8")
      };
      readBinary = function readBinary(filename) {
          var ret = read_(filename, true);
          if (!ret.buffer) {
              ret = new Uint8Array(ret)
          }
          assert(ret.buffer);
          return ret
      };
      if (process["argv"].length > 1) {
          thisProgram = process["argv"][1].replace(/\\/g, "/")
      }
      arguments_ = process["argv"].slice(2);
      if (typeof module !== "undefined") {
          module["exports"] = Module
      }
      quit_ = function(status) {
          process["exit"](status)
      };
      Module["inspect"] = function() {
          return "[Emscripten Module object]"
      }
  } else if (ENVIRONMENT_IS_SHELL) {
      if (typeof read != "undefined") {
          read_ = function shell_read(f) {
              return read(f)
          }
      }
      readBinary = function readBinary(f) {
          var data;
          if (typeof readbuffer === "function") {
              return new Uint8Array(readbuffer(f))
          }
          data = read(f, "binary");
          assert(typeof data === "object");
          return data
      };
      if (typeof scriptArgs != "undefined") {
          arguments_ = scriptArgs
      } else if (typeof arguments != "undefined") {
          arguments_ = arguments
      }
      if (typeof quit === "function") {
          quit_ = function(status) {
              quit(status)
          }
      }
      if (typeof print !== "undefined") {
          if (typeof console === "undefined") console = {};
          console.log = print;
          console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
      }
  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        /* PATCH START */
          if (SCRIPT_SRC) scriptDirectory=SCRIPT_SRC;
          else scriptDirectory=self.location.href
        /* PATCH END */
      } else if (document.currentScript) {
          scriptDirectory = document.currentScript.src
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
          scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
      } else {
          scriptDirectory = ""
      } {
          read_ = function shell_read(url) {
              var xhr = new XMLHttpRequest;
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText
          };
          if (ENVIRONMENT_IS_WORKER) {
              readBinary = function readBinary(url) {
                  var xhr = new XMLHttpRequest;
                  xhr.open("GET", url, false);
                  xhr.responseType = "arraybuffer";
                  xhr.send(null);
                  return new Uint8Array(xhr.response)
              }
          }
          readAsync = function readAsync(url, onload, onerror) {
              var xhr = new XMLHttpRequest;
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = function xhr_onload() {
                  if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                      onload(xhr.response);
                      return
                  }
                  onerror()
              };
              xhr.onerror = onerror;
              xhr.send(null)
          }
      }
      setWindowTitle = function(title) {
          document.title = title
      }
  } else {}
  var out = Module["print"] || console.log.bind(console);
  var err = Module["printErr"] || console.warn.bind(console);
  for (key in moduleOverrides) {
      if (moduleOverrides.hasOwnProperty(key)) {
          Module[key] = moduleOverrides[key]
      }
  }
  moduleOverrides = null;
  if (Module["arguments"]) arguments_ = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  if (Module["quit"]) quit_ = Module["quit"];

  function dynamicAlloc(size) {
      var ret = HEAP32[DYNAMICTOP_PTR >> 2];
      var end = ret + size + 15 & -16;
      HEAP32[DYNAMICTOP_PTR >> 2] = end;
      return ret
  }

  function getNativeTypeSize(type) {
      switch (type) {
          case "i1":
          case "i8":
              return 1;
          case "i16":
              return 2;
          case "i32":
              return 4;
          case "i64":
              return 8;
          case "float":
              return 4;
          case "double":
              return 8;
          default: {
              if (type[type.length - 1] === "*") {
                  return 4
              } else if (type[0] === "i") {
                  var bits = Number(type.substr(1));
                  assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                  return bits / 8
              } else {
                  return 0
              }
          }
      }
  }
  var tempRet0 = 0;
  var setTempRet0 = function(value) {
      tempRet0 = value
  };
  var getTempRet0 = function() {
      return tempRet0
  };
  var wasmBinary;
  if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
  var noExitRuntime;
  if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
  if (typeof WebAssembly !== "object") {
      err("no native wasm support detected")
  }

  function setValue(ptr, value, type, noSafe) {
      type = type || "i8";
      if (type.charAt(type.length - 1) === "*") type = "i32";
      switch (type) {
          case "i1":
              HEAP8[ptr >> 0] = value;
              break;
          case "i8":
              HEAP8[ptr >> 0] = value;
              break;
          case "i16":
              HEAP16[ptr >> 1] = value;
              break;
          case "i32":
              HEAP32[ptr >> 2] = value;
              break;
          case "i64":
              tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
              break;
          case "float":
              HEAPF32[ptr >> 2] = value;
              break;
          case "double":
              HEAPF64[ptr >> 3] = value;
              break;
          default:
              abort("invalid type for setValue: " + type)
      }
  }
  var wasmMemory;
  var wasmTable = new WebAssembly.Table({
      "initial": 1115,
      "maximum": 1115 + 0,
      "element": "anyfunc"
  });
  var ABORT = false;
  var EXITSTATUS = 0;

  function assert(condition, text) {
      if (!condition) {
          abort("Assertion failed: " + text)
      }
  }

  function getCFunc(ident) {
      var func = Module["_" + ident];
      assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
      return func
  }

  function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
          "string": function(str) {
              var ret = 0;
              if (str !== null && str !== undefined && str !== 0) {
                  var len = (str.length << 2) + 1;
                  ret = stackAlloc(len);
                  stringToUTF8(str, ret, len)
              }
              return ret
          },
          "array": function(arr) {
              var ret = stackAlloc(arr.length);
              writeArrayToMemory(arr, ret);
              return ret
          }
      };

      function convertReturnValue(ret) {
          if (returnType === "string") return UTF8ToString(ret);
          if (returnType === "boolean") return Boolean(ret);
          return ret
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
          for (var i = 0; i < args.length; i++) {
              var converter = toC[argTypes[i]];
              if (converter) {
                  if (stack === 0) stack = stackSave();
                  cArgs[i] = converter(args[i])
              } else {
                  cArgs[i] = args[i]
              }
          }
      }
      var ret = func.apply(null, cArgs);
      ret = convertReturnValue(ret);
      if (stack !== 0) stackRestore(stack);
      return ret
  }

  function cwrap(ident, returnType, argTypes, opts) {
      argTypes = argTypes || [];
      var numericArgs = argTypes.every(function(type) {
          return type === "number"
      });
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
          return getCFunc(ident)
      }
      return function() {
          return ccall(ident, returnType, argTypes, arguments, opts)
      }
  }
  var ALLOC_NONE = 3;

  function allocate(slab, types, allocator, ptr) {
      var zeroinit, size;
      if (typeof slab === "number") {
          zeroinit = true;
          size = slab
      } else {
          zeroinit = false;
          size = slab.length
      }
      var singleType = typeof types === "string" ? types : null;
      var ret;
      if (allocator == ALLOC_NONE) {
          ret = ptr
      } else {
          ret = [_malloc, stackAlloc, dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length))
      }
      if (zeroinit) {
          var stop;
          ptr = ret;
          assert((ret & 3) == 0);
          stop = ret + (size & ~3);
          for (; ptr < stop; ptr += 4) {
              HEAP32[ptr >> 2] = 0
          }
          stop = ret + size;
          while (ptr < stop) {
              HEAP8[ptr++ >> 0] = 0
          }
          return ret
      }
      if (singleType === "i8") {
          if (slab.subarray || slab.slice) {
              HEAPU8.set(slab, ret)
          } else {
              HEAPU8.set(new Uint8Array(slab), ret)
          }
          return ret
      }
      var i = 0,
          type, typeSize, previousType;
      while (i < size) {
          var curr = slab[i];
          type = singleType || types[i];
          if (type === 0) {
              i++;
              continue
          }
          if (type == "i64") type = "i32";
          setValue(ret + i, curr, type);
          if (previousType !== type) {
              typeSize = getNativeTypeSize(type);
              previousType = type
          }
          i += typeSize
      }
      return ret
  }
  var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

  function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
          return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
      } else {
          var str = "";
          while (idx < endPtr) {
              var u0 = u8Array[idx++];
              if (!(u0 & 128)) {
                  str += String.fromCharCode(u0);
                  continue
              }
              var u1 = u8Array[idx++] & 63;
              if ((u0 & 224) == 192) {
                  str += String.fromCharCode((u0 & 31) << 6 | u1);
                  continue
              }
              var u2 = u8Array[idx++] & 63;
              if ((u0 & 240) == 224) {
                  u0 = (u0 & 15) << 12 | u1 << 6 | u2
              } else {
                  u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
              }
              if (u0 < 65536) {
                  str += String.fromCharCode(u0)
              } else {
                  var ch = u0 - 65536;
                  str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
              }
          }
      }
      return str
  }

  function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
  }

  function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023
          }
          if (u <= 127) {
              if (outIdx >= endIdx) break;
              outU8Array[outIdx++] = u
          } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              outU8Array[outIdx++] = 192 | u >> 6;
              outU8Array[outIdx++] = 128 | u & 63
          } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              outU8Array[outIdx++] = 224 | u >> 12;
              outU8Array[outIdx++] = 128 | u >> 6 & 63;
              outU8Array[outIdx++] = 128 | u & 63
          } else {
              if (outIdx + 3 >= endIdx) break;
              outU8Array[outIdx++] = 240 | u >> 18;
              outU8Array[outIdx++] = 128 | u >> 12 & 63;
              outU8Array[outIdx++] = 128 | u >> 6 & 63;
              outU8Array[outIdx++] = 128 | u & 63
          }
      }
      outU8Array[outIdx] = 0;
      return outIdx - startIdx
  }

  function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
  }

  function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
          if (u <= 127) ++len;
          else if (u <= 2047) len += 2;
          else if (u <= 65535) len += 3;
          else len += 4
      }
      return len
  }
  var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

  function UTF16ToString(ptr) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      while (HEAP16[idx]) ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder) {
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr))
      } else {
          var i = 0;
          var str = "";
          while (1) {
              var codeUnit = HEAP16[ptr + i * 2 >> 1];
              if (codeUnit == 0) return str;
              ++i;
              str += String.fromCharCode(codeUnit)
          }
      }
  }

  function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr
  }

  function lengthBytesUTF16(str) {
      return str.length * 2
  }

  function UTF32ToString(ptr) {
      var i = 0;
      var str = "";
      while (1) {
          var utf32 = HEAP32[ptr + i * 4 >> 2];
          if (utf32 == 0) return str;
          ++i;
          if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
          } else {
              str += String.fromCharCode(utf32)
          }
      }
  }

  function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr
  }

  function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
          len += 4
      }
      return len
  }

  function allocateUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8Array(str, HEAP8, ret, size);
      return ret
  }

  function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer)
  }

  function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++ >> 0] = str.charCodeAt(i)
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0
  }
  var WASM_PAGE_SIZE = 65536;
  var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

  function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module["HEAP8"] = HEAP8 = new Int8Array(buf);
      Module["HEAP16"] = HEAP16 = new Int16Array(buf);
      Module["HEAP32"] = HEAP32 = new Int32Array(buf);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
  }
  var DYNAMIC_BASE = 5351632,
      DYNAMICTOP_PTR = 108576;
  var INITIAL_INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
  if (Module["wasmMemory"]) {
      wasmMemory = Module["wasmMemory"]
  } else {
      wasmMemory = new WebAssembly.Memory({
          "initial": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
          "maximum": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE
      })
  }
  if (wasmMemory) {
      buffer = wasmMemory.buffer
  }
  INITIAL_INITIAL_MEMORY = buffer.byteLength;
  updateGlobalBufferAndViews(buffer);
  HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
          var callback = callbacks.shift();
          if (typeof callback == "function") {
              callback();
              continue
          }
          var func = callback.func;
          if (typeof func === "number") {
              if (callback.arg === undefined) {
                  Module["dynCall_v"](func)
              } else {
                  Module["dynCall_vi"](func, callback.arg)
              }
          } else {
              func(callback.arg === undefined ? null : callback.arg)
          }
      }
  }
  var __ATPRERUN__ = [];
  var __ATINIT__ = [];
  var __ATMAIN__ = [];
  var __ATPOSTRUN__ = [];
  var runtimeInitialized = false;
  var runtimeExited = false;

  function preRun() {
      if (Module["preRun"]) {
          if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
          while (Module["preRun"].length) {
              addOnPreRun(Module["preRun"].shift())
          }
      }
      callRuntimeCallbacks(__ATPRERUN__)
  }

  function initRuntime() {
      runtimeInitialized = true;
      if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
      TTY.init();
      callRuntimeCallbacks(__ATINIT__)
  }

  function preMain() {
      FS.ignorePermissions = false;
      callRuntimeCallbacks(__ATMAIN__)
  }

  function exitRuntime() {
      runtimeExited = true
  }

  function postRun() {
      if (Module["postRun"]) {
          if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
          while (Module["postRun"].length) {
              addOnPostRun(Module["postRun"].shift())
          }
      }
      callRuntimeCallbacks(__ATPOSTRUN__)
  }

  function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb)
  }

  function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb)
  }
  var Math_abs = Math.abs;
  var Math_ceil = Math.ceil;
  var Math_floor = Math.floor;
  var Math_min = Math.min;
  var runDependencies = 0;
  var runDependencyWatcher = null;
  var dependenciesFulfilled = null;

  function getUniqueRunDependency(id) {
      return id
  }

  function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies)
      }
  }

  function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
          Module["monitorRunDependencies"](runDependencies)
      }
      if (runDependencies == 0) {
          if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null
          }
          if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback()
          }
      }
  }
  Module["preloadedImages"] = {};
  Module["preloadedAudios"] = {};

  function abort(what) {
      if (Module["onAbort"]) {
          Module["onAbort"](what)
      }
      what += "";
      out(what);
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
      throw new WebAssembly.RuntimeError(what)
  }
  var dataURIPrefix = "data:application/octet-stream;base64,";

  function isDataURI(filename) {
      return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
  }
  var wasmBinaryFile = "crypto.v1.12.0.wasm";
  var wasmFileName = wasmBinaryFile;
  if (!isDataURI(wasmBinaryFile)) {
      wasmBinaryFile = locateFile(wasmBinaryFile)
  }

  function getBinary() {
      try {
          if (wasmBinary) {
              return new Uint8Array(wasmBinary)
          }
          if (readBinary) {
              return readBinary(wasmBinaryFile)
          } else {
              throw "both async and sync fetching of the wasm failed"
          }
      } catch (err) {
          abort(err)
      }
  }

  function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        function tryToLoad(path) {
          return new Promise((resolve, reject) => {
            fetch(path, {
              credentials: "same-origin"
            }).then(function(response) {
                if (!response["ok"]) {
                    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                }
                resolve(response["arrayBuffer"]())
            }).catch(err => reject(err));
          });
        }

        return tryToLoad(wasmBinaryFile).catch(() => tryToLoad(`https://cdn.jsdelivr.net/npm/unicrypto@${PACKAGE_VERSION}/dist/` + wasmFileName));

      }
      return new Promise(function(resolve, reject) {
          resolve(getBinary())
      })
  }

  function createWasm() {
      var info = {
          "a": asmLibraryArg
      };

      function receiveInstance(instance, module) {
          var exports = instance.exports;
          Module["asm"] = exports;
          removeRunDependency("wasm-instantiate")
      }
      addRunDependency("wasm-instantiate");

      function receiveInstantiatedSource(output) {
          receiveInstance(output["instance"])
      }

      function instantiateArrayBuffer(receiver) {
          return getBinaryPromise().then(function(binary) {
              return WebAssembly.instantiate(binary, info)
          }).then(receiver, function(reason) {
              err("failed to asynchronously prepare wasm: " + reason);
              abort(reason)
          })
      }

      function instantiateAsync() {
          if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
              fetch(wasmBinaryFile, {
                  credentials: "same-origin"
              }).then(function(response) {
                  var result = WebAssembly.instantiateStreaming(response, info);
                  return result.then(receiveInstantiatedSource, function(reason) {
                      err("wasm streaming compile failed: " + reason);
                      err("falling back to ArrayBuffer instantiation");
                      instantiateArrayBuffer(receiveInstantiatedSource)
                  })
              })
          } else {
              return instantiateArrayBuffer(receiveInstantiatedSource)
          }
      }
      if (Module["instantiateWasm"]) {
          try {
              var exports = Module["instantiateWasm"](info, receiveInstance);
              return exports
          } catch (e) {
              err("Module.instantiateWasm callback failed with error: " + e);
              return false
          }
      }
      instantiateAsync();
      return {}
  }
  var tempDouble;
  var tempI64;
  __ATINIT__.push({
      func: function() {
          ___wasm_call_ctors()
      }
  });

  function demangle(func) {
      return func
  }

  function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(regex, function(x) {
          var y = demangle(x);
          return x === y ? x : y + " [" + x + "]"
      })
  }

  function jsStackTrace() {
      var err = new Error;
      if (!err.stack) {
          try {
              throw new Error
          } catch (e) {
              err = e
          }
          if (!err.stack) {
              return "(no stack trace available)"
          }
      }
      return err.stack.toString()
  }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
      return demangleAll(js)
  }

  function ___cxa_allocate_exception(size) {
      return _malloc(size)
  }
  var ___exception_infos = {};
  var ___exception_caught = [];

  function ___exception_addRef(ptr) {
      if (!ptr) return;
      var info = ___exception_infos[ptr];
      info.refcount++
  }

  function ___exception_deAdjust(adjusted) {
      if (!adjusted || ___exception_infos[adjusted]) return adjusted;
      for (var key in ___exception_infos) {
          var ptr = +key;
          var adj = ___exception_infos[ptr].adjusted;
          var len = adj.length;
          for (var i = 0; i < len; i++) {
              if (adj[i] === adjusted) {
                  return ptr
              }
          }
      }
      return adjusted
  }

  function ___cxa_begin_catch(ptr) {
      var info = ___exception_infos[ptr];
      if (info && !info.caught) {
          info.caught = true;
          __ZSt18uncaught_exceptionv.uncaught_exceptions--
      }
      if (info) info.rethrown = false;
      ___exception_caught.push(ptr);
      ___exception_addRef(___exception_deAdjust(ptr));
      return ptr
  }
  var ___exception_last = 0;

  function ___cxa_free_exception(ptr) {
      try {
          return _free(ptr)
      } catch (e) {}
  }

  function ___exception_decRef(ptr) {
      if (!ptr) return;
      var info = ___exception_infos[ptr];
      info.refcount--;
      if (info.refcount === 0 && !info.rethrown) {
          if (info.destructor) {
              Module["dynCall_ii"](info.destructor, ptr)
          }
          delete ___exception_infos[ptr];
          ___cxa_free_exception(ptr)
      }
  }

  function ___cxa_end_catch() {
      _setThrew(0);
      var ptr = ___exception_caught.pop();
      if (ptr) {
          ___exception_decRef(___exception_deAdjust(ptr));
          ___exception_last = 0
      }
  }

  function ___cxa_find_matching_catch_2() {
      var thrown = ___exception_last;
      if (!thrown) {
          return (setTempRet0(0), 0) | 0
      }
      var info = ___exception_infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
          return (setTempRet0(0), thrown) | 0
      }
      var typeArray = Array.prototype.slice.call(arguments);
      var pointer = ___cxa_is_pointer_type(throwntype);
      var buffer = 108736;
      HEAP32[buffer >> 2] = thrown;
      thrown = buffer;
      for (var i = 0; i < typeArray.length; i++) {
          if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
              thrown = HEAP32[thrown >> 2];
              info.adjusted.push(thrown);
              return (setTempRet0(typeArray[i]), thrown) | 0
          }
      }
      thrown = HEAP32[thrown >> 2];
      return (setTempRet0(throwntype), thrown) | 0
  }

  function ___cxa_find_matching_catch_3() {
      var thrown = ___exception_last;
      if (!thrown) {
          return (setTempRet0(0), 0) | 0
      }
      var info = ___exception_infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
          return (setTempRet0(0), thrown) | 0
      }
      var typeArray = Array.prototype.slice.call(arguments);
      var pointer = ___cxa_is_pointer_type(throwntype);
      var buffer = 108736;
      HEAP32[buffer >> 2] = thrown;
      thrown = buffer;
      for (var i = 0; i < typeArray.length; i++) {
          if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
              thrown = HEAP32[thrown >> 2];
              info.adjusted.push(thrown);
              return (setTempRet0(typeArray[i]), thrown) | 0
          }
      }
      thrown = HEAP32[thrown >> 2];
      return (setTempRet0(throwntype), thrown) | 0
  }

  function ___cxa_find_matching_catch_4() {
      var thrown = ___exception_last;
      if (!thrown) {
          return (setTempRet0(0), 0) | 0
      }
      var info = ___exception_infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
          return (setTempRet0(0), thrown) | 0
      }
      var typeArray = Array.prototype.slice.call(arguments);
      var pointer = ___cxa_is_pointer_type(throwntype);
      var buffer = 108736;
      HEAP32[buffer >> 2] = thrown;
      thrown = buffer;
      for (var i = 0; i < typeArray.length; i++) {
          if (typeArray[i] && ___cxa_can_catch(typeArray[i], throwntype, thrown)) {
              thrown = HEAP32[thrown >> 2];
              info.adjusted.push(thrown);
              return (setTempRet0(typeArray[i]), thrown) | 0
          }
      }
      thrown = HEAP32[thrown >> 2];
      return (setTempRet0(throwntype), thrown) | 0
  }

  function ___cxa_rethrow() {
      var ptr = ___exception_caught.pop();
      ptr = ___exception_deAdjust(ptr);
      if (!___exception_infos[ptr].rethrown) {
          ___exception_caught.push(ptr);
          ___exception_infos[ptr].rethrown = true
      }
      ___exception_last = ptr;
      throw ptr
  }

  function ___cxa_throw(ptr, type, destructor) {
      ___exception_infos[ptr] = {
          ptr: ptr,
          adjusted: [ptr],
          type: type,
          destructor: destructor,
          refcount: 0,
          caught: false,
          rethrown: false
      };
      ___exception_last = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
          __ZSt18uncaught_exceptionv.uncaught_exceptions = 1
      } else {
          __ZSt18uncaught_exceptionv.uncaught_exceptions++
      }
      throw ptr
  }

  function ___cxa_uncaught_exceptions() {
      return __ZSt18uncaught_exceptionv.uncaught_exceptions
  }

  function ___setErrNo(value) {
      if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
      return value
  }

  function ___map_file(pathname, size) {
      ___setErrNo(63);
      return -1
  }

  function ___resumeException(ptr) {
      if (!___exception_last) {
          ___exception_last = ptr
      }
      throw ptr
  }
  var PATH = {
      splitPath: function(filename) {
          var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
          return splitPathRe.exec(filename).slice(1)
      },
      normalizeArray: function(parts, allowAboveRoot) {
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
              var last = parts[i];
              if (last === ".") {
                  parts.splice(i, 1)
              } else if (last === "..") {
                  parts.splice(i, 1);
                  up++
              } else if (up) {
                  parts.splice(i, 1);
                  up--
              }
          }
          if (allowAboveRoot) {
              for (; up; up--) {
                  parts.unshift("..")
              }
          }
          return parts
      },
      normalize: function(path) {
          var isAbsolute = path.charAt(0) === "/",
              trailingSlash = path.substr(-1) === "/";
          path = PATH.normalizeArray(path.split("/").filter(function(p) {
              return !!p
          }), !isAbsolute).join("/");
          if (!path && !isAbsolute) {
              path = "."
          }
          if (path && trailingSlash) {
              path += "/"
          }
          return (isAbsolute ? "/" : "") + path
      },
      dirname: function(path) {
          var result = PATH.splitPath(path),
              root = result[0],
              dir = result[1];
          if (!root && !dir) {
              return "."
          }
          if (dir) {
              dir = dir.substr(0, dir.length - 1)
          }
          return root + dir
      },
      basename: function(path) {
          if (path === "/") return "/";
          var lastSlash = path.lastIndexOf("/");
          if (lastSlash === -1) return path;
          return path.substr(lastSlash + 1)
      },
      extname: function(path) {
          return PATH.splitPath(path)[3]
      },
      join: function() {
          var paths = Array.prototype.slice.call(arguments, 0);
          return PATH.normalize(paths.join("/"))
      },
      join2: function(l, r) {
          return PATH.normalize(l + "/" + r)
      }
  };
  var PATH_FS = {
      resolve: function() {
          var resolvedPath = "",
              resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
              var path = i >= 0 ? arguments[i] : FS.cwd();
              if (typeof path !== "string") {
                  throw new TypeError("Arguments to path.resolve must be strings")
              } else if (!path) {
                  return ""
              }
              resolvedPath = path + "/" + resolvedPath;
              resolvedAbsolute = path.charAt(0) === "/"
          }
          resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
              return !!p
          }), !resolvedAbsolute).join("/");
          return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
      },
      relative: function(from, to) {
          from = PATH_FS.resolve(from).substr(1);
          to = PATH_FS.resolve(to).substr(1);

          function trim(arr) {
              var start = 0;
              for (; start < arr.length; start++) {
                  if (arr[start] !== "") break
              }
              var end = arr.length - 1;
              for (; end >= 0; end--) {
                  if (arr[end] !== "") break
              }
              if (start > end) return [];
              return arr.slice(start, end - start + 1)
          }
          var fromParts = trim(from.split("/"));
          var toParts = trim(to.split("/"));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
              if (fromParts[i] !== toParts[i]) {
                  samePartsLength = i;
                  break
              }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
              outputParts.push("..")
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join("/")
      }
  };
  var TTY = {
      ttys: [],
      init: function() {},
      shutdown: function() {},
      register: function(dev, ops) {
          TTY.ttys[dev] = {
              input: [],
              output: [],
              ops: ops
          };
          FS.registerDevice(dev, TTY.stream_ops)
      },
      stream_ops: {
          open: function(stream) {
              var tty = TTY.ttys[stream.node.rdev];
              if (!tty) {
                  throw new FS.ErrnoError(43)
              }
              stream.tty = tty;
              stream.seekable = false
          },
          close: function(stream) {
              stream.tty.ops.flush(stream.tty)
          },
          flush: function(stream) {
              stream.tty.ops.flush(stream.tty)
          },
          read: function(stream, buffer, offset, length, pos) {
              if (!stream.tty || !stream.tty.ops.get_char) {
                  throw new FS.ErrnoError(60)
              }
              var bytesRead = 0;
              for (var i = 0; i < length; i++) {
                  var result;
                  try {
                      result = stream.tty.ops.get_char(stream.tty)
                  } catch (e) {
                      throw new FS.ErrnoError(29)
                  }
                  if (result === undefined && bytesRead === 0) {
                      throw new FS.ErrnoError(6)
                  }
                  if (result === null || result === undefined) break;
                  bytesRead++;
                  buffer[offset + i] = result
              }
              if (bytesRead) {
                  stream.node.timestamp = Date.now()
              }
              return bytesRead
          },
          write: function(stream, buffer, offset, length, pos) {
              if (!stream.tty || !stream.tty.ops.put_char) {
                  throw new FS.ErrnoError(60)
              }
              try {
                  for (var i = 0; i < length; i++) {
                      stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                  }
              } catch (e) {
                  throw new FS.ErrnoError(29)
              }
              if (length) {
                  stream.node.timestamp = Date.now()
              }
              return i
          }
      },
      default_tty_ops: {
          get_char: function(tty) {
              if (!tty.input.length) {
                  var result = null;
                  if (ENVIRONMENT_IS_NODE) {
                      var BUFSIZE = 256;
                      var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                      var bytesRead = 0;
                      try {
                          bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
                      } catch (e) {
                          if (e.toString().indexOf("EOF") != -1) bytesRead = 0;
                          else throw e
                      }
                      if (bytesRead > 0) {
                          result = buf.slice(0, bytesRead).toString("utf-8")
                      } else {
                          result = null
                      }
                  } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                      result = window.prompt("Input: ");
                      if (result !== null) {
                          result += "\n"
                      }
                  } else if (typeof readline == "function") {
                      result = readline();
                      if (result !== null) {
                          result += "\n"
                      }
                  }
                  if (!result) {
                      return null
                  }
                  tty.input = intArrayFromString(result, true)
              }
              return tty.input.shift()
          },
          put_char: function(tty, val) {
              if (val === null || val === 10) {
                  out(UTF8ArrayToString(tty.output, 0));
                  tty.output = []
              } else {
                  if (val != 0) tty.output.push(val)
              }
          },
          flush: function(tty) {
              if (tty.output && tty.output.length > 0) {
                  out(UTF8ArrayToString(tty.output, 0));
                  tty.output = []
              }
          }
      },
      default_tty1_ops: {
          put_char: function(tty, val) {
              if (val === null || val === 10) {
                  err(UTF8ArrayToString(tty.output, 0));
                  tty.output = []
              } else {
                  if (val != 0) tty.output.push(val)
              }
          },
          flush: function(tty) {
              if (tty.output && tty.output.length > 0) {
                  err(UTF8ArrayToString(tty.output, 0));
                  tty.output = []
              }
          }
      }
  };
  var MEMFS = {
      ops_table: null,
      mount: function(mount) {
          return MEMFS.createNode(null, "/", 16384 | 511, 0)
      },
      createNode: function(parent, name, mode, dev) {
          if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
              throw new FS.ErrnoError(63)
          }
          if (!MEMFS.ops_table) {
              MEMFS.ops_table = {
                  dir: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr,
                          lookup: MEMFS.node_ops.lookup,
                          mknod: MEMFS.node_ops.mknod,
                          rename: MEMFS.node_ops.rename,
                          unlink: MEMFS.node_ops.unlink,
                          rmdir: MEMFS.node_ops.rmdir,
                          readdir: MEMFS.node_ops.readdir,
                          symlink: MEMFS.node_ops.symlink
                      },
                      stream: {
                          llseek: MEMFS.stream_ops.llseek
                      }
                  },
                  file: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr
                      },
                      stream: {
                          llseek: MEMFS.stream_ops.llseek,
                          read: MEMFS.stream_ops.read,
                          write: MEMFS.stream_ops.write,
                          allocate: MEMFS.stream_ops.allocate,
                          mmap: MEMFS.stream_ops.mmap,
                          msync: MEMFS.stream_ops.msync
                      }
                  },
                  link: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr,
                          readlink: MEMFS.node_ops.readlink
                      },
                      stream: {}
                  },
                  chrdev: {
                      node: {
                          getattr: MEMFS.node_ops.getattr,
                          setattr: MEMFS.node_ops.setattr
                      },
                      stream: FS.chrdev_stream_ops
                  }
              }
          }
          var node = FS.createNode(parent, name, mode, dev);
          if (FS.isDir(node.mode)) {
              node.node_ops = MEMFS.ops_table.dir.node;
              node.stream_ops = MEMFS.ops_table.dir.stream;
              node.contents = {}
          } else if (FS.isFile(node.mode)) {
              node.node_ops = MEMFS.ops_table.file.node;
              node.stream_ops = MEMFS.ops_table.file.stream;
              node.usedBytes = 0;
              node.contents = null
          } else if (FS.isLink(node.mode)) {
              node.node_ops = MEMFS.ops_table.link.node;
              node.stream_ops = MEMFS.ops_table.link.stream
          } else if (FS.isChrdev(node.mode)) {
              node.node_ops = MEMFS.ops_table.chrdev.node;
              node.stream_ops = MEMFS.ops_table.chrdev.stream
          }
          node.timestamp = Date.now();
          if (parent) {
              parent.contents[name] = node
          }
          return node
      },
      getFileDataAsRegularArray: function(node) {
          if (node.contents && node.contents.subarray) {
              var arr = [];
              for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
              return arr
          }
          return node.contents
      },
      getFileDataAsTypedArray: function(node) {
          if (!node.contents) return new Uint8Array(0);
          if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
          return new Uint8Array(node.contents)
      },
      expandFileStorage: function(node, newCapacity) {
          var prevCapacity = node.contents ? node.contents.length : 0;
          if (prevCapacity >= newCapacity) return;
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity);
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
          return
      },
      resizeFileStorage: function(node, newSize) {
          if (node.usedBytes == newSize) return;
          if (newSize == 0) {
              node.contents = null;
              node.usedBytes = 0;
              return
          }
          if (!node.contents || node.contents.subarray) {
              var oldContents = node.contents;
              node.contents = new Uint8Array(newSize);
              if (oldContents) {
                  node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
              }
              node.usedBytes = newSize;
              return
          }
          if (!node.contents) node.contents = [];
          if (node.contents.length > newSize) node.contents.length = newSize;
          else
              while (node.contents.length < newSize) node.contents.push(0);
          node.usedBytes = newSize
      },
      node_ops: {
          getattr: function(node) {
              var attr = {};
              attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
              attr.ino = node.id;
              attr.mode = node.mode;
              attr.nlink = 1;
              attr.uid = 0;
              attr.gid = 0;
              attr.rdev = node.rdev;
              if (FS.isDir(node.mode)) {
                  attr.size = 4096
              } else if (FS.isFile(node.mode)) {
                  attr.size = node.usedBytes
              } else if (FS.isLink(node.mode)) {
                  attr.size = node.link.length
              } else {
                  attr.size = 0
              }
              attr.atime = new Date(node.timestamp);
              attr.mtime = new Date(node.timestamp);
              attr.ctime = new Date(node.timestamp);
              attr.blksize = 4096;
              attr.blocks = Math.ceil(attr.size / attr.blksize);
              return attr
          },
          setattr: function(node, attr) {
              if (attr.mode !== undefined) {
                  node.mode = attr.mode
              }
              if (attr.timestamp !== undefined) {
                  node.timestamp = attr.timestamp
              }
              if (attr.size !== undefined) {
                  MEMFS.resizeFileStorage(node, attr.size)
              }
          },
          lookup: function(parent, name) {
              throw FS.genericErrors[44]
          },
          mknod: function(parent, name, mode, dev) {
              return MEMFS.createNode(parent, name, mode, dev)
          },
          rename: function(old_node, new_dir, new_name) {
              if (FS.isDir(old_node.mode)) {
                  var new_node;
                  try {
                      new_node = FS.lookupNode(new_dir, new_name)
                  } catch (e) {}
                  if (new_node) {
                      for (var i in new_node.contents) {
                          throw new FS.ErrnoError(55)
                      }
                  }
              }
              delete old_node.parent.contents[old_node.name];
              old_node.name = new_name;
              new_dir.contents[new_name] = old_node;
              old_node.parent = new_dir
          },
          unlink: function(parent, name) {
              delete parent.contents[name]
          },
          rmdir: function(parent, name) {
              var node = FS.lookupNode(parent, name);
              for (var i in node.contents) {
                  throw new FS.ErrnoError(55)
              }
              delete parent.contents[name]
          },
          readdir: function(node) {
              var entries = [".", ".."];
              for (var key in node.contents) {
                  if (!node.contents.hasOwnProperty(key)) {
                      continue
                  }
                  entries.push(key)
              }
              return entries
          },
          symlink: function(parent, newname, oldpath) {
              var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
              node.link = oldpath;
              return node
          },
          readlink: function(node) {
              if (!FS.isLink(node.mode)) {
                  throw new FS.ErrnoError(28)
              }
              return node.link
          }
      },
      stream_ops: {
          read: function(stream, buffer, offset, length, position) {
              var contents = stream.node.contents;
              if (position >= stream.node.usedBytes) return 0;
              var size = Math.min(stream.node.usedBytes - position, length);
              if (size > 8 && contents.subarray) {
                  buffer.set(contents.subarray(position, position + size), offset)
              } else {
                  for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
              }
              return size
          },
          write: function(stream, buffer, offset, length, position, canOwn) {
              if (!length) return 0;
              var node = stream.node;
              node.timestamp = Date.now();
              if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                  if (canOwn) {
                      node.contents = buffer.subarray(offset, offset + length);
                      node.usedBytes = length;
                      return length
                  } else if (node.usedBytes === 0 && position === 0) {
                      node.contents = buffer.slice(offset, offset + length);
                      node.usedBytes = length;
                      return length
                  } else if (position + length <= node.usedBytes) {
                      node.contents.set(buffer.subarray(offset, offset + length), position);
                      return length
                  }
              }
              MEMFS.expandFileStorage(node, position + length);
              if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position);
              else {
                  for (var i = 0; i < length; i++) {
                      node.contents[position + i] = buffer[offset + i]
                  }
              }
              node.usedBytes = Math.max(node.usedBytes, position + length);
              return length
          },
          llseek: function(stream, offset, whence) {
              var position = offset;
              if (whence === 1) {
                  position += stream.position
              } else if (whence === 2) {
                  if (FS.isFile(stream.node.mode)) {
                      position += stream.node.usedBytes
                  }
              }
              if (position < 0) {
                  throw new FS.ErrnoError(28)
              }
              return position
          },
          allocate: function(stream, offset, length) {
              MEMFS.expandFileStorage(stream.node, offset + length);
              stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
          },
          mmap: function(stream, buffer, offset, length, position, prot, flags) {
              if (!FS.isFile(stream.node.mode)) {
                  throw new FS.ErrnoError(43)
              }
              var ptr;
              var allocated;
              var contents = stream.node.contents;
              if (!(flags & 2) && contents.buffer === buffer.buffer) {
                  allocated = false;
                  ptr = contents.byteOffset
              } else {
                  if (position > 0 || position + length < contents.length) {
                      if (contents.subarray) {
                          contents = contents.subarray(position, position + length)
                      } else {
                          contents = Array.prototype.slice.call(contents, position, position + length)
                      }
                  }
                  allocated = true;
                  var fromHeap = buffer.buffer == HEAP8.buffer;
                  ptr = _malloc(length);
                  if (!ptr) {
                      throw new FS.ErrnoError(48)
                  }(fromHeap ? HEAP8 : buffer).set(contents, ptr)
              }
              return {
                  ptr: ptr,
                  allocated: allocated
              }
          },
          msync: function(stream, buffer, offset, length, mmapFlags) {
              if (!FS.isFile(stream.node.mode)) {
                  throw new FS.ErrnoError(43)
              }
              if (mmapFlags & 2) {
                  return 0
              }
              var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
              return 0
          }
      }
  };
  var FS = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: "/",
      initialized: false,
      ignorePermissions: true,
      trackingDelegate: {},
      tracking: {
          openFlags: {
              READ: 1,
              WRITE: 2
          }
      },
      ErrnoError: null,
      genericErrors: {},
      filesystems: null,
      syncFSRequests: 0,
      handleFSError: function(e) {
          if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
          return ___setErrNo(e.errno)
      },
      lookupPath: function(path, opts) {
          path = PATH_FS.resolve(FS.cwd(), path);
          opts = opts || {};
          if (!path) return {
              path: "",
              node: null
          };
          var defaults = {
              follow_mount: true,
              recurse_count: 0
          };
          for (var key in defaults) {
              if (opts[key] === undefined) {
                  opts[key] = defaults[key]
              }
          }
          if (opts.recurse_count > 8) {
              throw new FS.ErrnoError(32)
          }
          var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
              return !!p
          }), false);
          var current = FS.root;
          var current_path = "/";
          for (var i = 0; i < parts.length; i++) {
              var islast = i === parts.length - 1;
              if (islast && opts.parent) {
                  break
              }
              current = FS.lookupNode(current, parts[i]);
              current_path = PATH.join2(current_path, parts[i]);
              if (FS.isMountpoint(current)) {
                  if (!islast || islast && opts.follow_mount) {
                      current = current.mounted.root
                  }
              }
              if (!islast || opts.follow) {
                  var count = 0;
                  while (FS.isLink(current.mode)) {
                      var link = FS.readlink(current_path);
                      current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                      var lookup = FS.lookupPath(current_path, {
                          recurse_count: opts.recurse_count
                      });
                      current = lookup.node;
                      if (count++ > 40) {
                          throw new FS.ErrnoError(32)
                      }
                  }
              }
          }
          return {
              path: current_path,
              node: current
          }
      },
      getPath: function(node) {
          var path;
          while (true) {
              if (FS.isRoot(node)) {
                  var mount = node.mount.mountpoint;
                  if (!path) return mount;
                  return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
              }
              path = path ? node.name + "/" + path : node.name;
              node = node.parent
          }
      },
      hashName: function(parentid, name) {
          var hash = 0;
          for (var i = 0; i < name.length; i++) {
              hash = (hash << 5) - hash + name.charCodeAt(i) | 0
          }
          return (parentid + hash >>> 0) % FS.nameTable.length
      },
      hashAddNode: function(node) {
          var hash = FS.hashName(node.parent.id, node.name);
          node.name_next = FS.nameTable[hash];
          FS.nameTable[hash] = node
      },
      hashRemoveNode: function(node) {
          var hash = FS.hashName(node.parent.id, node.name);
          if (FS.nameTable[hash] === node) {
              FS.nameTable[hash] = node.name_next
          } else {
              var current = FS.nameTable[hash];
              while (current) {
                  if (current.name_next === node) {
                      current.name_next = node.name_next;
                      break
                  }
                  current = current.name_next
              }
          }
      },
      lookupNode: function(parent, name) {
          var errCode = FS.mayLookup(parent);
          if (errCode) {
              throw new FS.ErrnoError(errCode, parent)
          }
          var hash = FS.hashName(parent.id, name);
          for (var node = FS.nameTable[hash]; node; node = node.name_next) {
              var nodeName = node.name;
              if (node.parent.id === parent.id && nodeName === name) {
                  return node
              }
          }
          return FS.lookup(parent, name)
      },
      createNode: function(parent, name, mode, rdev) {
          var node = new FS.FSNode(parent, name, mode, rdev);
          FS.hashAddNode(node);
          return node
      },
      destroyNode: function(node) {
          FS.hashRemoveNode(node)
      },
      isRoot: function(node) {
          return node === node.parent
      },
      isMountpoint: function(node) {
          return !!node.mounted
      },
      isFile: function(mode) {
          return (mode & 61440) === 32768
      },
      isDir: function(mode) {
          return (mode & 61440) === 16384
      },
      isLink: function(mode) {
          return (mode & 61440) === 40960
      },
      isChrdev: function(mode) {
          return (mode & 61440) === 8192
      },
      isBlkdev: function(mode) {
          return (mode & 61440) === 24576
      },
      isFIFO: function(mode) {
          return (mode & 61440) === 4096
      },
      isSocket: function(mode) {
          return (mode & 49152) === 49152
      },
      flagModes: {
          "r": 0,
          "rs": 1052672,
          "r+": 2,
          "w": 577,
          "wx": 705,
          "xw": 705,
          "w+": 578,
          "wx+": 706,
          "xw+": 706,
          "a": 1089,
          "ax": 1217,
          "xa": 1217,
          "a+": 1090,
          "ax+": 1218,
          "xa+": 1218
      },
      modeStringToFlags: function(str) {
          var flags = FS.flagModes[str];
          if (typeof flags === "undefined") {
              throw new Error("Unknown file open mode: " + str)
          }
          return flags
      },
      flagsToPermissionString: function(flag) {
          var perms = ["r", "w", "rw"][flag & 3];
          if (flag & 512) {
              perms += "w"
          }
          return perms
      },
      nodePermissions: function(node, perms) {
          if (FS.ignorePermissions) {
              return 0
          }
          if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
              return 2
          } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
              return 2
          } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
              return 2
          }
          return 0
      },
      mayLookup: function(dir) {
          var errCode = FS.nodePermissions(dir, "x");
          if (errCode) return errCode;
          if (!dir.node_ops.lookup) return 2;
          return 0
      },
      mayCreate: function(dir, name) {
          try {
              var node = FS.lookupNode(dir, name);
              return 20
          } catch (e) {}
          return FS.nodePermissions(dir, "wx")
      },
      mayDelete: function(dir, name, isdir) {
          var node;
          try {
              node = FS.lookupNode(dir, name)
          } catch (e) {
              return e.errno
          }
          var errCode = FS.nodePermissions(dir, "wx");
          if (errCode) {
              return errCode
          }
          if (isdir) {
              if (!FS.isDir(node.mode)) {
                  return 54
              }
              if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                  return 10
              }
          } else {
              if (FS.isDir(node.mode)) {
                  return 31
              }
          }
          return 0
      },
      mayOpen: function(node, flags) {
          if (!node) {
              return 44
          }
          if (FS.isLink(node.mode)) {
              return 32
          } else if (FS.isDir(node.mode)) {
              if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                  return 31
              }
          }
          return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
      },
      MAX_OPEN_FDS: 4096,
      nextfd: function(fd_start, fd_end) {
          fd_start = fd_start || 0;
          fd_end = fd_end || FS.MAX_OPEN_FDS;
          for (var fd = fd_start; fd <= fd_end; fd++) {
              if (!FS.streams[fd]) {
                  return fd
              }
          }
          throw new FS.ErrnoError(33)
      },
      getStream: function(fd) {
          return FS.streams[fd]
      },
      createStream: function(stream, fd_start, fd_end) {
          if (!FS.FSStream) {
              FS.FSStream = function() {};
              FS.FSStream.prototype = {
                  object: {
                      get: function() {
                          return this.node
                      },
                      set: function(val) {
                          this.node = val
                      }
                  },
                  isRead: {
                      get: function() {
                          return (this.flags & 2097155) !== 1
                      }
                  },
                  isWrite: {
                      get: function() {
                          return (this.flags & 2097155) !== 0
                      }
                  },
                  isAppend: {
                      get: function() {
                          return this.flags & 1024
                      }
                  }
              }
          }
          var newStream = new FS.FSStream;
          for (var p in stream) {
              newStream[p] = stream[p]
          }
          stream = newStream;
          var fd = FS.nextfd(fd_start, fd_end);
          stream.fd = fd;
          FS.streams[fd] = stream;
          return stream
      },
      closeStream: function(fd) {
          FS.streams[fd] = null
      },
      chrdev_stream_ops: {
          open: function(stream) {
              var device = FS.getDevice(stream.node.rdev);
              stream.stream_ops = device.stream_ops;
              if (stream.stream_ops.open) {
                  stream.stream_ops.open(stream)
              }
          },
          llseek: function() {
              throw new FS.ErrnoError(70)
          }
      },
      major: function(dev) {
          return dev >> 8
      },
      minor: function(dev) {
          return dev & 255
      },
      makedev: function(ma, mi) {
          return ma << 8 | mi
      },
      registerDevice: function(dev, ops) {
          FS.devices[dev] = {
              stream_ops: ops
          }
      },
      getDevice: function(dev) {
          return FS.devices[dev]
      },
      getMounts: function(mount) {
          var mounts = [];
          var check = [mount];
          while (check.length) {
              var m = check.pop();
              mounts.push(m);
              check.push.apply(check, m.mounts)
          }
          return mounts
      },
      syncfs: function(populate, callback) {
          if (typeof populate === "function") {
              callback = populate;
              populate = false
          }
          FS.syncFSRequests++;
          if (FS.syncFSRequests > 1) {
              err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
          }
          var mounts = FS.getMounts(FS.root.mount);
          var completed = 0;

          function doCallback(errCode) {
              FS.syncFSRequests--;
              return callback(errCode)
          }

          function done(errCode) {
              if (errCode) {
                  if (!done.errored) {
                      done.errored = true;
                      return doCallback(errCode)
                  }
                  return
              }
              if (++completed >= mounts.length) {
                  doCallback(null)
              }
          }
          mounts.forEach(function(mount) {
              if (!mount.type.syncfs) {
                  return done(null)
              }
              mount.type.syncfs(mount, populate, done)
          })
      },
      mount: function(type, opts, mountpoint) {
          var root = mountpoint === "/";
          var pseudo = !mountpoint;
          var node;
          if (root && FS.root) {
              throw new FS.ErrnoError(10)
          } else if (!root && !pseudo) {
              var lookup = FS.lookupPath(mountpoint, {
                  follow_mount: false
              });
              mountpoint = lookup.path;
              node = lookup.node;
              if (FS.isMountpoint(node)) {
                  throw new FS.ErrnoError(10)
              }
              if (!FS.isDir(node.mode)) {
                  throw new FS.ErrnoError(54)
              }
          }
          var mount = {
              type: type,
              opts: opts,
              mountpoint: mountpoint,
              mounts: []
          };
          var mountRoot = type.mount(mount);
          mountRoot.mount = mount;
          mount.root = mountRoot;
          if (root) {
              FS.root = mountRoot
          } else if (node) {
              node.mounted = mount;
              if (node.mount) {
                  node.mount.mounts.push(mount)
              }
          }
          return mountRoot
      },
      unmount: function(mountpoint) {
          var lookup = FS.lookupPath(mountpoint, {
              follow_mount: false
          });
          if (!FS.isMountpoint(lookup.node)) {
              throw new FS.ErrnoError(28)
          }
          var node = lookup.node;
          var mount = node.mounted;
          var mounts = FS.getMounts(mount);
          Object.keys(FS.nameTable).forEach(function(hash) {
              var current = FS.nameTable[hash];
              while (current) {
                  var next = current.name_next;
                  if (mounts.indexOf(current.mount) !== -1) {
                      FS.destroyNode(current)
                  }
                  current = next
              }
          });
          node.mounted = null;
          var idx = node.mount.mounts.indexOf(mount);
          node.mount.mounts.splice(idx, 1)
      },
      lookup: function(parent, name) {
          return parent.node_ops.lookup(parent, name)
      },
      mknod: function(path, mode, dev) {
          var lookup = FS.lookupPath(path, {
              parent: true
          });
          var parent = lookup.node;
          var name = PATH.basename(path);
          if (!name || name === "." || name === "..") {
              throw new FS.ErrnoError(28)
          }
          var errCode = FS.mayCreate(parent, name);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          if (!parent.node_ops.mknod) {
              throw new FS.ErrnoError(63)
          }
          return parent.node_ops.mknod(parent, name, mode, dev)
      },
      create: function(path, mode) {
          mode = mode !== undefined ? mode : 438;
          mode &= 4095;
          mode |= 32768;
          return FS.mknod(path, mode, 0)
      },
      mkdir: function(path, mode) {
          mode = mode !== undefined ? mode : 511;
          mode &= 511 | 512;
          mode |= 16384;
          return FS.mknod(path, mode, 0)
      },
      mkdirTree: function(path, mode) {
          var dirs = path.split("/");
          var d = "";
          for (var i = 0; i < dirs.length; ++i) {
              if (!dirs[i]) continue;
              d += "/" + dirs[i];
              try {
                  FS.mkdir(d, mode)
              } catch (e) {
                  if (e.errno != 20) throw e
              }
          }
      },
      mkdev: function(path, mode, dev) {
          if (typeof dev === "undefined") {
              dev = mode;
              mode = 438
          }
          mode |= 8192;
          return FS.mknod(path, mode, dev)
      },
      symlink: function(oldpath, newpath) {
          if (!PATH_FS.resolve(oldpath)) {
              throw new FS.ErrnoError(44)
          }
          var lookup = FS.lookupPath(newpath, {
              parent: true
          });
          var parent = lookup.node;
          if (!parent) {
              throw new FS.ErrnoError(44)
          }
          var newname = PATH.basename(newpath);
          var errCode = FS.mayCreate(parent, newname);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          if (!parent.node_ops.symlink) {
              throw new FS.ErrnoError(63)
          }
          return parent.node_ops.symlink(parent, newname, oldpath)
      },
      rename: function(old_path, new_path) {
          var old_dirname = PATH.dirname(old_path);
          var new_dirname = PATH.dirname(new_path);
          var old_name = PATH.basename(old_path);
          var new_name = PATH.basename(new_path);
          var lookup, old_dir, new_dir;
          try {
              lookup = FS.lookupPath(old_path, {
                  parent: true
              });
              old_dir = lookup.node;
              lookup = FS.lookupPath(new_path, {
                  parent: true
              });
              new_dir = lookup.node
          } catch (e) {
              throw new FS.ErrnoError(10)
          }
          if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
          if (old_dir.mount !== new_dir.mount) {
              throw new FS.ErrnoError(75)
          }
          var old_node = FS.lookupNode(old_dir, old_name);
          var relative = PATH_FS.relative(old_path, new_dirname);
          if (relative.charAt(0) !== ".") {
              throw new FS.ErrnoError(28)
          }
          relative = PATH_FS.relative(new_path, old_dirname);
          if (relative.charAt(0) !== ".") {
              throw new FS.ErrnoError(55)
          }
          var new_node;
          try {
              new_node = FS.lookupNode(new_dir, new_name)
          } catch (e) {}
          if (old_node === new_node) {
              return
          }
          var isdir = FS.isDir(old_node.mode);
          var errCode = FS.mayDelete(old_dir, old_name, isdir);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          if (!old_dir.node_ops.rename) {
              throw new FS.ErrnoError(63)
          }
          if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
              throw new FS.ErrnoError(10)
          }
          if (new_dir !== old_dir) {
              errCode = FS.nodePermissions(old_dir, "w");
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
          }
          try {
              if (FS.trackingDelegate["willMovePath"]) {
                  FS.trackingDelegate["willMovePath"](old_path, new_path)
              }
          } catch (e) {
              err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
          }
          FS.hashRemoveNode(old_node);
          try {
              old_dir.node_ops.rename(old_node, new_dir, new_name)
          } catch (e) {
              throw e
          } finally {
              FS.hashAddNode(old_node)
          }
          try {
              if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
          } catch (e) {
              err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
          }
      },
      rmdir: function(path) {
          var lookup = FS.lookupPath(path, {
              parent: true
          });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, true);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          if (!parent.node_ops.rmdir) {
              throw new FS.ErrnoError(63)
          }
          if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(10)
          }
          try {
              if (FS.trackingDelegate["willDeletePath"]) {
                  FS.trackingDelegate["willDeletePath"](path)
              }
          } catch (e) {
              err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
          }
          parent.node_ops.rmdir(parent, name);
          FS.destroyNode(node);
          try {
              if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
          } catch (e) {
              err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
          }
      },
      readdir: function(path) {
          var lookup = FS.lookupPath(path, {
              follow: true
          });
          var node = lookup.node;
          if (!node.node_ops.readdir) {
              throw new FS.ErrnoError(54)
          }
          return node.node_ops.readdir(node)
      },
      unlink: function(path) {
          var lookup = FS.lookupPath(path, {
              parent: true
          });
          var parent = lookup.node;
          var name = PATH.basename(path);
          var node = FS.lookupNode(parent, name);
          var errCode = FS.mayDelete(parent, name, false);
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          if (!parent.node_ops.unlink) {
              throw new FS.ErrnoError(63)
          }
          if (FS.isMountpoint(node)) {
              throw new FS.ErrnoError(10)
          }
          try {
              if (FS.trackingDelegate["willDeletePath"]) {
                  FS.trackingDelegate["willDeletePath"](path)
              }
          } catch (e) {
              err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
          }
          parent.node_ops.unlink(parent, name);
          FS.destroyNode(node);
          try {
              if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
          } catch (e) {
              err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
          }
      },
      readlink: function(path) {
          var lookup = FS.lookupPath(path);
          var link = lookup.node;
          if (!link) {
              throw new FS.ErrnoError(44)
          }
          if (!link.node_ops.readlink) {
              throw new FS.ErrnoError(28)
          }
          return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
      },
      stat: function(path, dontFollow) {
          var lookup = FS.lookupPath(path, {
              follow: !dontFollow
          });
          var node = lookup.node;
          if (!node) {
              throw new FS.ErrnoError(44)
          }
          if (!node.node_ops.getattr) {
              throw new FS.ErrnoError(63)
          }
          return node.node_ops.getattr(node)
      },
      lstat: function(path) {
          return FS.stat(path, true)
      },
      chmod: function(path, mode, dontFollow) {
          var node;
          if (typeof path === "string") {
              var lookup = FS.lookupPath(path, {
                  follow: !dontFollow
              });
              node = lookup.node
          } else {
              node = path
          }
          if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(63)
          }
          node.node_ops.setattr(node, {
              mode: mode & 4095 | node.mode & ~4095,
              timestamp: Date.now()
          })
      },
      lchmod: function(path, mode) {
          FS.chmod(path, mode, true)
      },
      fchmod: function(fd, mode) {
          var stream = FS.getStream(fd);
          if (!stream) {
              throw new FS.ErrnoError(8)
          }
          FS.chmod(stream.node, mode)
      },
      chown: function(path, uid, gid, dontFollow) {
          var node;
          if (typeof path === "string") {
              var lookup = FS.lookupPath(path, {
                  follow: !dontFollow
              });
              node = lookup.node
          } else {
              node = path
          }
          if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(63)
          }
          node.node_ops.setattr(node, {
              timestamp: Date.now()
          })
      },
      lchown: function(path, uid, gid) {
          FS.chown(path, uid, gid, true)
      },
      fchown: function(fd, uid, gid) {
          var stream = FS.getStream(fd);
          if (!stream) {
              throw new FS.ErrnoError(8)
          }
          FS.chown(stream.node, uid, gid)
      },
      truncate: function(path, len) {
          if (len < 0) {
              throw new FS.ErrnoError(28)
          }
          var node;
          if (typeof path === "string") {
              var lookup = FS.lookupPath(path, {
                  follow: true
              });
              node = lookup.node
          } else {
              node = path
          }
          if (!node.node_ops.setattr) {
              throw new FS.ErrnoError(63)
          }
          if (FS.isDir(node.mode)) {
              throw new FS.ErrnoError(31)
          }
          if (!FS.isFile(node.mode)) {
              throw new FS.ErrnoError(28)
          }
          var errCode = FS.nodePermissions(node, "w");
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          node.node_ops.setattr(node, {
              size: len,
              timestamp: Date.now()
          })
      },
      ftruncate: function(fd, len) {
          var stream = FS.getStream(fd);
          if (!stream) {
              throw new FS.ErrnoError(8)
          }
          if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(28)
          }
          FS.truncate(stream.node, len)
      },
      utime: function(path, atime, mtime) {
          var lookup = FS.lookupPath(path, {
              follow: true
          });
          var node = lookup.node;
          node.node_ops.setattr(node, {
              timestamp: Math.max(atime, mtime)
          })
      },
      open: function(path, flags, mode, fd_start, fd_end) {
          if (path === "") {
              throw new FS.ErrnoError(44)
          }
          flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
          mode = typeof mode === "undefined" ? 438 : mode;
          if (flags & 64) {
              mode = mode & 4095 | 32768
          } else {
              mode = 0
          }
          var node;
          if (typeof path === "object") {
              node = path
          } else {
              path = PATH.normalize(path);
              try {
                  var lookup = FS.lookupPath(path, {
                      follow: !(flags & 131072)
                  });
                  node = lookup.node
              } catch (e) {}
          }
          var created = false;
          if (flags & 64) {
              if (node) {
                  if (flags & 128) {
                      throw new FS.ErrnoError(20)
                  }
              } else {
                  node = FS.mknod(path, mode, 0);
                  created = true
              }
          }
          if (!node) {
              throw new FS.ErrnoError(44)
          }
          if (FS.isChrdev(node.mode)) {
              flags &= ~512
          }
          if (flags & 65536 && !FS.isDir(node.mode)) {
              throw new FS.ErrnoError(54)
          }
          if (!created) {
              var errCode = FS.mayOpen(node, flags);
              if (errCode) {
                  throw new FS.ErrnoError(errCode)
              }
          }
          if (flags & 512) {
              FS.truncate(node, 0)
          }
          flags &= ~(128 | 512);
          var stream = FS.createStream({
              node: node,
              path: FS.getPath(node),
              flags: flags,
              seekable: true,
              position: 0,
              stream_ops: node.stream_ops,
              ungotten: [],
              error: false
          }, fd_start, fd_end);
          if (stream.stream_ops.open) {
              stream.stream_ops.open(stream)
          }
          if (Module["logReadFiles"] && !(flags & 1)) {
              if (!FS.readFiles) FS.readFiles = {};
              if (!(path in FS.readFiles)) {
                  FS.readFiles[path] = 1;
                  err("FS.trackingDelegate error on read file: " + path)
              }
          }
          try {
              if (FS.trackingDelegate["onOpenFile"]) {
                  var trackingFlags = 0;
                  if ((flags & 2097155) !== 1) {
                      trackingFlags |= FS.tracking.openFlags.READ
                  }
                  if ((flags & 2097155) !== 0) {
                      trackingFlags |= FS.tracking.openFlags.WRITE
                  }
                  FS.trackingDelegate["onOpenFile"](path, trackingFlags)
              }
          } catch (e) {
              err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
          }
          return stream
      },
      close: function(stream) {
          if (FS.isClosed(stream)) {
              throw new FS.ErrnoError(8)
          }
          if (stream.getdents) stream.getdents = null;
          try {
              if (stream.stream_ops.close) {
                  stream.stream_ops.close(stream)
              }
          } catch (e) {
              throw e
          } finally {
              FS.closeStream(stream.fd)
          }
          stream.fd = null
      },
      isClosed: function(stream) {
          return stream.fd === null
      },
      llseek: function(stream, offset, whence) {
          if (FS.isClosed(stream)) {
              throw new FS.ErrnoError(8)
          }
          if (!stream.seekable || !stream.stream_ops.llseek) {
              throw new FS.ErrnoError(70)
          }
          if (whence != 0 && whence != 1 && whence != 2) {
              throw new FS.ErrnoError(28)
          }
          stream.position = stream.stream_ops.llseek(stream, offset, whence);
          stream.ungotten = [];
          return stream.position
      },
      read: function(stream, buffer, offset, length, position) {
          if (length < 0 || position < 0) {
              throw new FS.ErrnoError(28)
          }
          if (FS.isClosed(stream)) {
              throw new FS.ErrnoError(8)
          }
          if ((stream.flags & 2097155) === 1) {
              throw new FS.ErrnoError(8)
          }
          if (FS.isDir(stream.node.mode)) {
              throw new FS.ErrnoError(31)
          }
          if (!stream.stream_ops.read) {
              throw new FS.ErrnoError(28)
          }
          var seeking = typeof position !== "undefined";
          if (!seeking) {
              position = stream.position
          } else if (!stream.seekable) {
              throw new FS.ErrnoError(70)
          }
          var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
          if (!seeking) stream.position += bytesRead;
          return bytesRead
      },
      write: function(stream, buffer, offset, length, position, canOwn) {
          if (length < 0 || position < 0) {
              throw new FS.ErrnoError(28)
          }
          if (FS.isClosed(stream)) {
              throw new FS.ErrnoError(8)
          }
          if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(8)
          }
          if (FS.isDir(stream.node.mode)) {
              throw new FS.ErrnoError(31)
          }
          if (!stream.stream_ops.write) {
              throw new FS.ErrnoError(28)
          }
          if (stream.flags & 1024) {
              FS.llseek(stream, 0, 2)
          }
          var seeking = typeof position !== "undefined";
          if (!seeking) {
              position = stream.position
          } else if (!stream.seekable) {
              throw new FS.ErrnoError(70)
          }
          var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
          if (!seeking) stream.position += bytesWritten;
          try {
              if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
          } catch (e) {
              err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
          }
          return bytesWritten
      },
      allocate: function(stream, offset, length) {
          if (FS.isClosed(stream)) {
              throw new FS.ErrnoError(8)
          }
          if (offset < 0 || length <= 0) {
              throw new FS.ErrnoError(28)
          }
          if ((stream.flags & 2097155) === 0) {
              throw new FS.ErrnoError(8)
          }
          if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
              throw new FS.ErrnoError(43)
          }
          if (!stream.stream_ops.allocate) {
              throw new FS.ErrnoError(138)
          }
          stream.stream_ops.allocate(stream, offset, length)
      },
      mmap: function(stream, buffer, offset, length, position, prot, flags) {
          if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
              throw new FS.ErrnoError(2)
          }
          if ((stream.flags & 2097155) === 1) {
              throw new FS.ErrnoError(2)
          }
          if (!stream.stream_ops.mmap) {
              throw new FS.ErrnoError(43)
          }
          return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags)
      },
      msync: function(stream, buffer, offset, length, mmapFlags) {
          if (!stream || !stream.stream_ops.msync) {
              return 0
          }
          return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
      },
      munmap: function(stream) {
          return 0
      },
      ioctl: function(stream, cmd, arg) {
          if (!stream.stream_ops.ioctl) {
              throw new FS.ErrnoError(59)
          }
          return stream.stream_ops.ioctl(stream, cmd, arg)
      },
      readFile: function(path, opts) {
          opts = opts || {};
          opts.flags = opts.flags || "r";
          opts.encoding = opts.encoding || "binary";
          if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
              throw new Error('Invalid encoding type "' + opts.encoding + '"')
          }
          var ret;
          var stream = FS.open(path, opts.flags);
          var stat = FS.stat(path);
          var length = stat.size;
          var buf = new Uint8Array(length);
          FS.read(stream, buf, 0, length, 0);
          if (opts.encoding === "utf8") {
              ret = UTF8ArrayToString(buf, 0)
          } else if (opts.encoding === "binary") {
              ret = buf
          }
          FS.close(stream);
          return ret
      },
      writeFile: function(path, data, opts) {
          opts = opts || {};
          opts.flags = opts.flags || "w";
          var stream = FS.open(path, opts.flags, opts.mode);
          if (typeof data === "string") {
              var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
              var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
              FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
          } else if (ArrayBuffer.isView(data)) {
              FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
          } else {
              throw new Error("Unsupported data type")
          }
          FS.close(stream)
      },
      cwd: function() {
          return FS.currentPath
      },
      chdir: function(path) {
          var lookup = FS.lookupPath(path, {
              follow: true
          });
          if (lookup.node === null) {
              throw new FS.ErrnoError(44)
          }
          if (!FS.isDir(lookup.node.mode)) {
              throw new FS.ErrnoError(54)
          }
          var errCode = FS.nodePermissions(lookup.node, "x");
          if (errCode) {
              throw new FS.ErrnoError(errCode)
          }
          FS.currentPath = lookup.path
      },
      createDefaultDirectories: function() {
          FS.mkdir("/tmp");
          FS.mkdir("/home");
          FS.mkdir("/home/web_user")
      },
      createDefaultDevices: function() {
          FS.mkdir("/dev");
          FS.registerDevice(FS.makedev(1, 3), {
              read: function() {
                  return 0
              },
              write: function(stream, buffer, offset, length, pos) {
                  return length
              }
          });
          FS.mkdev("/dev/null", FS.makedev(1, 3));
          TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
          TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
          FS.mkdev("/dev/tty", FS.makedev(5, 0));
          FS.mkdev("/dev/tty1", FS.makedev(6, 0));
          var random_device;
          if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
              var randomBuffer = new Uint8Array(1);
              random_device = function() {
                  crypto.getRandomValues(randomBuffer);
                  return randomBuffer[0]
              }
          } else if (ENVIRONMENT_IS_NODE) {
              try {
                  var crypto_module = require("crypto");
                  random_device = function() {
                      return crypto_module["randomBytes"](1)[0]
                  }
              } catch (e) {}
          } else {}
          if (!random_device) {
              random_device = function() {
                  abort("random_device")
              }
          }
          FS.createDevice("/dev", "random", random_device);
          FS.createDevice("/dev", "urandom", random_device);
          FS.mkdir("/dev/shm");
          FS.mkdir("/dev/shm/tmp")
      },
      createSpecialDirectories: function() {
          FS.mkdir("/proc");
          FS.mkdir("/proc/self");
          FS.mkdir("/proc/self/fd");
          FS.mount({
              mount: function() {
                  var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
                  node.node_ops = {
                      lookup: function(parent, name) {
                          var fd = +name;
                          var stream = FS.getStream(fd);
                          if (!stream) throw new FS.ErrnoError(8);
                          var ret = {
                              parent: null,
                              mount: {
                                  mountpoint: "fake"
                              },
                              node_ops: {
                                  readlink: function() {
                                      return stream.path
                                  }
                              }
                          };
                          ret.parent = ret;
                          return ret
                      }
                  };
                  return node
              }
          }, {}, "/proc/self/fd")
      },
      createStandardStreams: function() {
          if (Module["stdin"]) {
              FS.createDevice("/dev", "stdin", Module["stdin"])
          } else {
              FS.symlink("/dev/tty", "/dev/stdin")
          }
          if (Module["stdout"]) {
              FS.createDevice("/dev", "stdout", null, Module["stdout"])
          } else {
              FS.symlink("/dev/tty", "/dev/stdout")
          }
          if (Module["stderr"]) {
              FS.createDevice("/dev", "stderr", null, Module["stderr"])
          } else {
              FS.symlink("/dev/tty1", "/dev/stderr")
          }
          var stdin = FS.open("/dev/stdin", "r");
          var stdout = FS.open("/dev/stdout", "w");
          var stderr = FS.open("/dev/stderr", "w")
      },
      ensureErrnoError: function() {
          if (FS.ErrnoError) return;
          FS.ErrnoError = function ErrnoError(errno, node) {
              this.node = node;
              this.setErrno = function(errno) {
                  this.errno = errno
              };
              this.setErrno(errno);
              this.message = "FS error"
          };
          FS.ErrnoError.prototype = new Error;
          FS.ErrnoError.prototype.constructor = FS.ErrnoError;
          [44].forEach(function(code) {
              FS.genericErrors[code] = new FS.ErrnoError(code);
              FS.genericErrors[code].stack = "<generic error, no stack>"
          })
      },
      staticInit: function() {
          FS.ensureErrnoError();
          FS.nameTable = new Array(4096);
          FS.mount(MEMFS, {}, "/");
          FS.createDefaultDirectories();
          FS.createDefaultDevices();
          FS.createSpecialDirectories();
          FS.filesystems = {
              "MEMFS": MEMFS
          }
      },
      init: function(input, output, error) {
          FS.init.initialized = true;
          FS.ensureErrnoError();
          Module["stdin"] = input || Module["stdin"];
          Module["stdout"] = output || Module["stdout"];
          Module["stderr"] = error || Module["stderr"];
          FS.createStandardStreams()
      },
      quit: function() {
          FS.init.initialized = false;
          var fflush = Module["_fflush"];
          if (fflush) fflush(0);
          for (var i = 0; i < FS.streams.length; i++) {
              var stream = FS.streams[i];
              if (!stream) {
                  continue
              }
              FS.close(stream)
          }
      },
      getMode: function(canRead, canWrite) {
          var mode = 0;
          if (canRead) mode |= 292 | 73;
          if (canWrite) mode |= 146;
          return mode
      },
      joinPath: function(parts, forceRelative) {
          var path = PATH.join.apply(null, parts);
          if (forceRelative && path[0] == "/") path = path.substr(1);
          return path
      },
      absolutePath: function(relative, base) {
          return PATH_FS.resolve(base, relative)
      },
      standardizePath: function(path) {
          return PATH.normalize(path)
      },
      findObject: function(path, dontResolveLastLink) {
          var ret = FS.analyzePath(path, dontResolveLastLink);
          if (ret.exists) {
              return ret.object
          } else {
              ___setErrNo(ret.error);
              return null
          }
      },
      analyzePath: function(path, dontResolveLastLink) {
          try {
              var lookup = FS.lookupPath(path, {
                  follow: !dontResolveLastLink
              });
              path = lookup.path
          } catch (e) {}
          var ret = {
              isRoot: false,
              exists: false,
              error: 0,
              name: null,
              path: null,
              object: null,
              parentExists: false,
              parentPath: null,
              parentObject: null
          };
          try {
              var lookup = FS.lookupPath(path, {
                  parent: true
              });
              ret.parentExists = true;
              ret.parentPath = lookup.path;
              ret.parentObject = lookup.node;
              ret.name = PATH.basename(path);
              lookup = FS.lookupPath(path, {
                  follow: !dontResolveLastLink
              });
              ret.exists = true;
              ret.path = lookup.path;
              ret.object = lookup.node;
              ret.name = lookup.node.name;
              ret.isRoot = lookup.path === "/"
          } catch (e) {
              ret.error = e.errno
          }
          return ret
      },
      createFolder: function(parent, name, canRead, canWrite) {
          var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.mkdir(path, mode)
      },
      createPath: function(parent, path, canRead, canWrite) {
          parent = typeof parent === "string" ? parent : FS.getPath(parent);
          var parts = path.split("/").reverse();
          while (parts.length) {
              var part = parts.pop();
              if (!part) continue;
              var current = PATH.join2(parent, part);
              try {
                  FS.mkdir(current)
              } catch (e) {}
              parent = current
          }
          return current
      },
      createFile: function(parent, name, properties, canRead, canWrite) {
          var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(canRead, canWrite);
          return FS.create(path, mode)
      },
      createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
          var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
          var mode = FS.getMode(canRead, canWrite);
          var node = FS.create(path, mode);
          if (data) {
              if (typeof data === "string") {
                  var arr = new Array(data.length);
                  for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                  data = arr
              }
              FS.chmod(node, mode | 146);
              var stream = FS.open(node, "w");
              FS.write(stream, data, 0, data.length, 0, canOwn);
              FS.close(stream);
              FS.chmod(node, mode)
          }
          return node
      },
      createDevice: function(parent, name, input, output) {
          var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
          var mode = FS.getMode(!!input, !!output);
          if (!FS.createDevice.major) FS.createDevice.major = 64;
          var dev = FS.makedev(FS.createDevice.major++, 0);
          FS.registerDevice(dev, {
              open: function(stream) {
                  stream.seekable = false
              },
              close: function(stream) {
                  if (output && output.buffer && output.buffer.length) {
                      output(10)
                  }
              },
              read: function(stream, buffer, offset, length, pos) {
                  var bytesRead = 0;
                  for (var i = 0; i < length; i++) {
                      var result;
                      try {
                          result = input()
                      } catch (e) {
                          throw new FS.ErrnoError(29)
                      }
                      if (result === undefined && bytesRead === 0) {
                          throw new FS.ErrnoError(6)
                      }
                      if (result === null || result === undefined) break;
                      bytesRead++;
                      buffer[offset + i] = result
                  }
                  if (bytesRead) {
                      stream.node.timestamp = Date.now()
                  }
                  return bytesRead
              },
              write: function(stream, buffer, offset, length, pos) {
                  for (var i = 0; i < length; i++) {
                      try {
                          output(buffer[offset + i])
                      } catch (e) {
                          throw new FS.ErrnoError(29)
                      }
                  }
                  if (length) {
                      stream.node.timestamp = Date.now()
                  }
                  return i
              }
          });
          return FS.mkdev(path, mode, dev)
      },
      createLink: function(parent, name, target, canRead, canWrite) {
          var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
          return FS.symlink(target, path)
      },
      forceLoadFile: function(obj) {
          if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
          var success = true;
          if (typeof XMLHttpRequest !== "undefined") {
              throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
          } else if (read_) {
              try {
                  obj.contents = intArrayFromString(read_(obj.url), true);
                  obj.usedBytes = obj.contents.length
              } catch (e) {
                  success = false
              }
          } else {
              throw new Error("Cannot load without read() or XMLHttpRequest.")
          }
          if (!success) ___setErrNo(29);
          return success
      },
      createLazyFile: function(parent, name, url, canRead, canWrite) {
          function LazyUint8Array() {
              this.lengthKnown = false;
              this.chunks = []
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
              if (idx > this.length - 1 || idx < 0) {
                  return undefined
              }
              var chunkOffset = idx % this.chunkSize;
              var chunkNum = idx / this.chunkSize | 0;
              return this.getter(chunkNum)[chunkOffset]
          };
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
              this.getter = getter
          };
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              var xhr = new XMLHttpRequest;
              xhr.open("HEAD", url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
              var chunkSize = 1024 * 1024;
              if (!hasByteServing) chunkSize = datalength;
              var doXHR = function(from, to) {
                  if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                  if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                  var xhr = new XMLHttpRequest;
                  xhr.open("GET", url, false);
                  if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                  if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
                  if (xhr.overrideMimeType) {
                      xhr.overrideMimeType("text/plain; charset=x-user-defined")
                  }
                  xhr.send(null);
                  if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                  if (xhr.response !== undefined) {
                      return new Uint8Array(xhr.response || [])
                  } else {
                      return intArrayFromString(xhr.responseText || "", true)
                  }
              };
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                  var start = chunkNum * chunkSize;
                  var end = (chunkNum + 1) * chunkSize - 1;
                  end = Math.min(end, datalength - 1);
                  if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                      lazyArray.chunks[chunkNum] = doXHR(start, end)
                  }
                  if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
                  return lazyArray.chunks[chunkNum]
              });
              if (usesGzip || !datalength) {
                  chunkSize = datalength = 1;
                  datalength = this.getter(0).length;
                  chunkSize = datalength;
                  out("LazyFiles on gzip forces download of the whole file when length is accessed")
              }
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true
          };
          if (typeof XMLHttpRequest !== "undefined") {
              if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
              var lazyArray = new LazyUint8Array;
              Object.defineProperties(lazyArray, {
                  length: {
                      get: function() {
                          if (!this.lengthKnown) {
                              this.cacheLength()
                          }
                          return this._length
                      }
                  },
                  chunkSize: {
                      get: function() {
                          if (!this.lengthKnown) {
                              this.cacheLength()
                          }
                          return this._chunkSize
                      }
                  }
              });
              var properties = {
                  isDevice: false,
                  contents: lazyArray
              }
          } else {
              var properties = {
                  isDevice: false,
                  url: url
              }
          }
          var node = FS.createFile(parent, name, properties, canRead, canWrite);
          if (properties.contents) {
              node.contents = properties.contents
          } else if (properties.url) {
              node.contents = null;
              node.url = properties.url
          }
          Object.defineProperties(node, {
              usedBytes: {
                  get: function() {
                      return this.contents.length
                  }
              }
          });
          var stream_ops = {};
          var keys = Object.keys(node.stream_ops);
          keys.forEach(function(key) {
              var fn = node.stream_ops[key];
              stream_ops[key] = function forceLoadLazyFile() {
                  if (!FS.forceLoadFile(node)) {
                      throw new FS.ErrnoError(29)
                  }
                  return fn.apply(null, arguments)
              }
          });
          stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
              if (!FS.forceLoadFile(node)) {
                  throw new FS.ErrnoError(29)
              }
              var contents = stream.node.contents;
              if (position >= contents.length) return 0;
              var size = Math.min(contents.length - position, length);
              if (contents.slice) {
                  for (var i = 0; i < size; i++) {
                      buffer[offset + i] = contents[position + i]
                  }
              } else {
                  for (var i = 0; i < size; i++) {
                      buffer[offset + i] = contents.get(position + i)
                  }
              }
              return size
          };
          node.stream_ops = stream_ops;
          return node
      },
      createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
          Browser.init();
          var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
          var dep = getUniqueRunDependency("cp " + fullname);

          function processData(byteArray) {
              function finish(byteArray) {
                  if (preFinish) preFinish();
                  if (!dontCreateFile) {
                      FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                  }
                  if (onload) onload();
                  removeRunDependency(dep)
              }
              var handled = false;
              Module["preloadPlugins"].forEach(function(plugin) {
                  if (handled) return;
                  if (plugin["canHandle"](fullname)) {
                      plugin["handle"](byteArray, fullname, finish, function() {
                          if (onerror) onerror();
                          removeRunDependency(dep)
                      });
                      handled = true
                  }
              });
              if (!handled) finish(byteArray)
          }
          addRunDependency(dep);
          if (typeof url == "string") {
              Browser.asyncLoad(url, function(byteArray) {
                  processData(byteArray)
              }, onerror)
          } else {
              processData(url)
          }
      },
      indexedDB: function() {
          return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
      },
      DB_NAME: function() {
          return "EM_FS_" + window.location.pathname
      },
      DB_VERSION: 20,
      DB_STORE_NAME: "FILE_DATA",
      saveFilesToDB: function(paths, onload, onerror) {
          onload = onload || function() {};
          onerror = onerror || function() {};
          var indexedDB = FS.indexedDB();
          try {
              var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
          } catch (e) {
              return onerror(e)
          }
          openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
              out("creating db");
              var db = openRequest.result;
              db.createObjectStore(FS.DB_STORE_NAME)
          };
          openRequest.onsuccess = function openRequest_onsuccess() {
              var db = openRequest.result;
              var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
              var files = transaction.objectStore(FS.DB_STORE_NAME);
              var ok = 0,
                  fail = 0,
                  total = paths.length;

              function finish() {
                  if (fail == 0) onload();
                  else onerror()
              }
              paths.forEach(function(path) {
                  var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                  putRequest.onsuccess = function putRequest_onsuccess() {
                      ok++;
                      if (ok + fail == total) finish()
                  };
                  putRequest.onerror = function putRequest_onerror() {
                      fail++;
                      if (ok + fail == total) finish()
                  }
              });
              transaction.onerror = onerror
          };
          openRequest.onerror = onerror
      },
      loadFilesFromDB: function(paths, onload, onerror) {
          onload = onload || function() {};
          onerror = onerror || function() {};
          var indexedDB = FS.indexedDB();
          try {
              var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
          } catch (e) {
              return onerror(e)
          }
          openRequest.onupgradeneeded = onerror;
          openRequest.onsuccess = function openRequest_onsuccess() {
              var db = openRequest.result;
              try {
                  var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
              } catch (e) {
                  onerror(e);
                  return
              }
              var files = transaction.objectStore(FS.DB_STORE_NAME);
              var ok = 0,
                  fail = 0,
                  total = paths.length;

              function finish() {
                  if (fail == 0) onload();
                  else onerror()
              }
              paths.forEach(function(path) {
                  var getRequest = files.get(path);
                  getRequest.onsuccess = function getRequest_onsuccess() {
                      if (FS.analyzePath(path).exists) {
                          FS.unlink(path)
                      }
                      FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                      ok++;
                      if (ok + fail == total) finish()
                  };
                  getRequest.onerror = function getRequest_onerror() {
                      fail++;
                      if (ok + fail == total) finish()
                  }
              });
              transaction.onerror = onerror
          };
          openRequest.onerror = onerror
      }
  };
  var SYSCALLS = {
      mappings: {},
      DEFAULT_POLLMASK: 5,
      umask: 511,
      calculateAt: function(dirfd, path) {
          if (path[0] !== "/") {
              var dir;
              if (dirfd === -100) {
                  dir = FS.cwd()
              } else {
                  var dirstream = FS.getStream(dirfd);
                  if (!dirstream) throw new FS.ErrnoError(8);
                  dir = dirstream.path
              }
              path = PATH.join2(dir, path)
          }
          return path
      },
      doStat: function(func, path, buf) {
          try {
              var stat = func(path)
          } catch (e) {
              if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                  return -54
              }
              throw e
          }
          HEAP32[buf >> 2] = stat.dev;
          HEAP32[buf + 4 >> 2] = 0;
          HEAP32[buf + 8 >> 2] = stat.ino;
          HEAP32[buf + 12 >> 2] = stat.mode;
          HEAP32[buf + 16 >> 2] = stat.nlink;
          HEAP32[buf + 20 >> 2] = stat.uid;
          HEAP32[buf + 24 >> 2] = stat.gid;
          HEAP32[buf + 28 >> 2] = stat.rdev;
          HEAP32[buf + 32 >> 2] = 0;
          tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
          HEAP32[buf + 48 >> 2] = 4096;
          HEAP32[buf + 52 >> 2] = stat.blocks;
          HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
          HEAP32[buf + 60 >> 2] = 0;
          HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
          HEAP32[buf + 68 >> 2] = 0;
          HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
          HEAP32[buf + 76 >> 2] = 0;
          tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
          return 0
      },
      doMsync: function(addr, stream, len, flags, offset) {
          var buffer = HEAPU8.slice(addr, addr + len);
          FS.msync(stream, buffer, offset, len, flags)
      },
      doMkdir: function(path, mode) {
          path = PATH.normalize(path);
          if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
          FS.mkdir(path, mode, 0);
          return 0
      },
      doMknod: function(path, mode, dev) {
          switch (mode & 61440) {
              case 32768:
              case 8192:
              case 24576:
              case 4096:
              case 49152:
                  break;
              default:
                  return -28
          }
          FS.mknod(path, mode, dev);
          return 0
      },
      doReadlink: function(path, buf, bufsize) {
          if (bufsize <= 0) return -28;
          var ret = FS.readlink(path);
          var len = Math.min(bufsize, lengthBytesUTF8(ret));
          var endChar = HEAP8[buf + len];
          stringToUTF8(ret, buf, bufsize + 1);
          HEAP8[buf + len] = endChar;
          return len
      },
      doAccess: function(path, amode) {
          if (amode & ~7) {
              return -28
          }
          var node;
          var lookup = FS.lookupPath(path, {
              follow: true
          });
          node = lookup.node;
          if (!node) {
              return -44
          }
          var perms = "";
          if (amode & 4) perms += "r";
          if (amode & 2) perms += "w";
          if (amode & 1) perms += "x";
          if (perms && FS.nodePermissions(node, perms)) {
              return -2
          }
          return 0
      },
      doDup: function(path, flags, suggestFD) {
          var suggest = FS.getStream(suggestFD);
          if (suggest) FS.close(suggest);
          return FS.open(path, flags, 0, suggestFD, suggestFD).fd
      },
      doReadv: function(stream, iov, iovcnt, offset) {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
              var ptr = HEAP32[iov + i * 8 >> 2];
              var len = HEAP32[iov + (i * 8 + 4) >> 2];
              var curr = FS.read(stream, HEAP8, ptr, len, offset);
              if (curr < 0) return -1;
              ret += curr;
              if (curr < len) break
          }
          return ret
      },
      doWritev: function(stream, iov, iovcnt, offset) {
          var ret = 0;
          for (var i = 0; i < iovcnt; i++) {
              var ptr = HEAP32[iov + i * 8 >> 2];
              var len = HEAP32[iov + (i * 8 + 4) >> 2];
              var curr = FS.write(stream, HEAP8, ptr, len, offset);
              if (curr < 0) return -1;
              ret += curr
          }
          return ret
      },
      varargs: undefined,
      get: function() {
          SYSCALLS.varargs += 4;
          var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
          return ret
      },
      getStr: function(ptr) {
          var ret = UTF8ToString(ptr);
          return ret
      },
      getStreamFromFD: function(fd) {
          var stream = FS.getStream(fd);
          if (!stream) throw new FS.ErrnoError(8);
          return stream
      },
      get64: function(low, high) {
          return low
      }
  };

  function ___syscall221(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (cmd) {
              case 0: {
                  var arg = SYSCALLS.get();
                  if (arg < 0) {
                      return -28
                  }
                  var newStream;
                  newStream = FS.open(stream.path, stream.flags, 0, arg);
                  return newStream.fd
              }
              case 1:
              case 2:
                  return 0;
              case 3:
                  return stream.flags;
              case 4: {
                  var arg = SYSCALLS.get();
                  stream.flags |= arg;
                  return 0
              }
              case 12: {
                  var arg = SYSCALLS.get();
                  var offset = 0;
                  HEAP16[arg + offset >> 1] = 2;
                  return 0
              }
              case 13:
              case 14:
                  return 0;
              case 16:
              case 8:
                  return -28;
              case 9:
                  ___setErrNo(28);
                  return -1;
              default: {
                  return -28
              }
          }
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return -e.errno
      }
  }

  function ___syscall5(path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
          var pathname = SYSCALLS.getStr(path);
          var mode = SYSCALLS.get();
          var stream = FS.open(pathname, flags, mode);
          return stream.fd
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return -e.errno
      }
  }

  function ___syscall54(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          switch (op) {
              case 21509:
              case 21505: {
                  if (!stream.tty) return -59;
                  return 0
              }
              case 21510:
              case 21511:
              case 21512:
              case 21506:
              case 21507:
              case 21508: {
                  if (!stream.tty) return -59;
                  return 0
              }
              case 21519: {
                  if (!stream.tty) return -59;
                  var argp = SYSCALLS.get();
                  HEAP32[argp >> 2] = 0;
                  return 0
              }
              case 21520: {
                  if (!stream.tty) return -59;
                  return -28
              }
              case 21531: {
                  var argp = SYSCALLS.get();
                  return FS.ioctl(stream, op, argp)
              }
              case 21523: {
                  if (!stream.tty) return -59;
                  return 0
              }
              case 21524: {
                  if (!stream.tty) return -59;
                  return 0
              }
              default:
                  abort("bad ioctl syscall " + op)
          }
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return -e.errno
      }
  }

  function syscallMunmap(addr, len) {
      if (addr === -1 || len === 0) {
          return -28
      }
      var info = SYSCALLS.mappings[addr];
      if (!info) return 0;
      if (len === info.len) {
          var stream = FS.getStream(info.fd);
          SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
          FS.munmap(stream);
          SYSCALLS.mappings[addr] = null;
          if (info.allocated) {
              _free(info.malloc)
          }
      }
      return 0
  }

  function ___syscall91(addr, len) {
      try {
          return syscallMunmap(addr, len)
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return -e.errno
      }
  }

  function getShiftFromSize(size) {
      switch (size) {
          case 1:
              return 0;
          case 2:
              return 1;
          case 4:
              return 2;
          case 8:
              return 3;
          default:
              throw new TypeError("Unknown type size: " + size)
      }
  }

  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i)
      }
      embind_charCodes = codes
  }
  var embind_charCodes = undefined;

  function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]]
      }
      return ret
  }
  var awaitingDependencies = {};
  var registeredTypes = {};
  var typeDependencies = {};
  var char_0 = 48;
  var char_9 = 57;

  function makeLegalFunctionName(name) {
      if (undefined === name) {
          return "_unknown"
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
          return "_" + name
      } else {
          return name
      }
  }

  function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
  }

  function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
          this.name = errorName;
          this.message = message;
          var stack = new Error(message).stack;
          if (stack !== undefined) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
          }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
          if (this.message === undefined) {
              return this.name
          } else {
              return this.name + ": " + this.message
          }
      };
      return errorClass
  }
  var BindingError = undefined;

  function throwBindingError(message) {
      throw new BindingError(message)
  }
  var InternalError = undefined;

  function throwInternalError(message) {
      throw new InternalError(message)
  }

  function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes
      });

      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count")
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i])
          }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i) {
          if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt]
          } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                  awaitingDependencies[dt] = []
              }
              awaitingDependencies[dt].push(function() {
                  typeConverters[i] = registeredTypes[dt];
                  ++registered;
                  if (registered === unregisteredTypes.length) {
                      onComplete(typeConverters)
                  }
              })
          }
      });
      if (0 === unregisteredTypes.length) {
          onComplete(typeConverters)
      }
  }

  function registerType(rawType, registeredInstance, options) {
      options = options || {};
      if (!("argPackAdvance" in registeredInstance)) {
          throw new TypeError("registerType registeredInstance requires argPackAdvance")
      }
      var name = registeredInstance.name;
      if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
              return
          } else {
              throwBindingError("Cannot register type '" + name + "' twice")
          }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach(function(cb) {
              cb()
          })
      }
  }

  function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          "fromWireType": function(wt) {
              return !!wt
          },
          "toWireType": function(destructors, o) {
              return o ? trueValue : falseValue
          },
          "argPackAdvance": 8,
          "readValueFromPointer": function(pointer) {
              var heap;
              if (size === 1) {
                  heap = HEAP8
              } else if (size === 2) {
                  heap = HEAP16
              } else if (size === 4) {
                  heap = HEAP32
              } else {
                  throw new TypeError("Unknown boolean type size: " + name)
              }
              return this["fromWireType"](heap[pointer >> shift])
          },
          destructorFunction: null
      })
  }

  function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
          return false
      }
      if (!(other instanceof ClassHandle)) {
          return false
      }
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
      while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass
      }
      while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass
      }
      return leftClass === rightClass && left === right
  }

  function shallowCopyInternalPointer(o) {
      return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType
      }
  }

  function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name
      }
      throwBindingError(getInstanceTypeName(obj) + " instance already deleted")
  }
  var finalizationGroup = false;

  function detachFinalizer(handle) {}

  function runDestructor($$) {
      if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr)
      } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr)
      }
  }

  function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
          runDestructor($$)
      }
  }

  function attachFinalizer(handle) {
      if ("undefined" === typeof FinalizationGroup) {
          attachFinalizer = function(handle) {
              return handle
          };
          return handle
      }
      finalizationGroup = new FinalizationGroup(function(iter) {
          for (var result = iter.next(); !result.done; result = iter.next()) {
              var $$ = result.value;
              if (!$$.ptr) {
                  console.warn("object already deleted: " + $$.ptr)
              } else {
                  releaseClassHandle($$)
              }
          }
      });
      attachFinalizer = function(handle) {
          finalizationGroup.register(handle, handle.$$, handle.$$);
          return handle
      };
      detachFinalizer = function(handle) {
          finalizationGroup.unregister(handle.$$)
      };
      return attachFinalizer(handle)
  }

  function ClassHandle_clone() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this)
      }
      if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this
      } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
              $$: {
                  value: shallowCopyInternalPointer(this.$$)
              }
          }));
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone
      }
  }

  function ClassHandle_delete() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this)
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError("Object already scheduled for deletion")
      }
      detachFinalizer(this);
      releaseClassHandle(this.$$);
      if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined
      }
  }

  function ClassHandle_isDeleted() {
      return !this.$$.ptr
  }
  var delayFunction = undefined;
  var deletionQueue = [];

  function flushPendingDeletes() {
      while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj["delete"]()
      }
  }

  function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this)
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError("Object already scheduled for deletion")
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes)
      }
      this.$$.deleteScheduled = true;
      return this
  }

  function init_ClassHandle() {
      ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
      ClassHandle.prototype["clone"] = ClassHandle_clone;
      ClassHandle.prototype["delete"] = ClassHandle_delete;
      ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
      ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater
  }

  function ClassHandle() {}
  var registeredPointers = {};

  function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          proto[methodName] = function() {
              if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                  throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
              }
              return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
          };
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
      }
  }

  function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
          if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
              throwBindingError("Cannot register public name '" + name + "' twice")
          }
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
              throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
          }
          Module[name].overloadTable[numArguments] = value
      } else {
          Module[name] = value;
          if (undefined !== numArguments) {
              Module[name].numArguments = numArguments
          }
      }
  }

  function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = []
  }

  function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
              throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name)
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass
      }
      return ptr
  }

  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
          if (this.isReference) {
              throwBindingError("null is not a valid " + this.name)
          }
          return 0
      }
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
      }
      if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr
  }

  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
          if (this.isReference) {
              throwBindingError("null is not a valid " + this.name)
          }
          if (this.isSmartPointer) {
              ptr = this.rawConstructor();
              if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr)
              }
              return ptr
          } else {
              return 0
          }
      }
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
      }
      if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      if (this.isSmartPointer) {
          if (undefined === handle.$$.smartPtr) {
              throwBindingError("Passing raw pointer to smart pointer is illegal")
          }
          switch (this.sharingPolicy) {
              case 0:
                  if (handle.$$.smartPtrType === this) {
                      ptr = handle.$$.smartPtr
                  } else {
                      throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
                  }
                  break;
              case 1:
                  ptr = handle.$$.smartPtr;
                  break;
              case 2:
                  if (handle.$$.smartPtrType === this) {
                      ptr = handle.$$.smartPtr
                  } else {
                      var clonedHandle = handle["clone"]();
                      ptr = this.rawShare(ptr, __emval_register(function() {
                          clonedHandle["delete"]()
                      }));
                      if (destructors !== null) {
                          destructors.push(this.rawDestructor, ptr)
                      }
                  }
                  break;
              default:
                  throwBindingError("Unsupporting sharing policy")
          }
      }
      return ptr
  }

  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
          if (this.isReference) {
              throwBindingError("null is not a valid " + this.name)
          }
          return 0
      }
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
      }
      if (!handle.$$.ptr) {
          throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
      }
      if (handle.$$.ptrType.isConst) {
          throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name)
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr
  }

  function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAPU32[pointer >> 2])
  }

  function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr)
      }
      return ptr
  }

  function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
          this.rawDestructor(ptr)
      }
  }

  function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
          handle["delete"]()
      }
  }

  function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
          return ptr
      }
      if (undefined === desiredClass.baseClass) {
          return null
      }
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
          return null
      }
      return desiredClass.downcast(rv)
  }

  function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length
  }

  function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
              rv.push(registeredInstances[k])
          }
      }
      return rv
  }

  function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes)
      }
  }

  function init_embind() {
      Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
      Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
      Module["flushPendingDeletes"] = flushPendingDeletes;
      Module["setDelayFunction"] = setDelayFunction
  }
  var registeredInstances = {};

  function getBasestPointer(class_, ptr) {
      if (ptr === undefined) {
          throwBindingError("ptr should not be undefined")
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass
      }
      return ptr
  }

  function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr]
  }

  function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
          throwInternalError("makeClassHandle requires ptr and ptrType")
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError("Both smartPtrType and smartPtr must be specified")
      }
      record.count = {
          value: 1
      };
      return attachFinalizer(Object.create(prototype, {
          $$: {
              value: record
          }
      }))
  }

  function RegisteredPointer_fromWireType(ptr) {
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
          this.destructor(ptr);
          return null
      }
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
          if (0 === registeredInstance.$$.count.value) {
              registeredInstance.$$.ptr = rawPointer;
              registeredInstance.$$.smartPtr = ptr;
              return registeredInstance["clone"]()
          } else {
              var rv = registeredInstance["clone"]();
              this.destructor(ptr);
              return rv
          }
      }

      function makeDefaultHandle() {
          if (this.isSmartPointer) {
              return makeClassHandle(this.registeredClass.instancePrototype, {
                  ptrType: this.pointeeType,
                  ptr: rawPointer,
                  smartPtrType: this,
                  smartPtr: ptr
              })
          } else {
              return makeClassHandle(this.registeredClass.instancePrototype, {
                  ptrType: this,
                  ptr: ptr
              })
          }
      }
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this)
      }
      var toType;
      if (this.isConst) {
          toType = registeredPointerRecord.constPointerType
      } else {
          toType = registeredPointerRecord.pointerType
      }
      var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
      if (dp === null) {
          return makeDefaultHandle.call(this)
      }
      if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
              ptrType: toType,
              ptr: dp,
              smartPtrType: this,
              smartPtr: ptr
          })
      } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
              ptrType: toType,
              ptr: dp
          })
      }
  }

  function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype["argPackAdvance"] = 8;
      RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
      RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType
  }

  function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
              this["toWireType"] = constNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null
          } else {
              this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null
          }
      } else {
          this["toWireType"] = genericPointerToWireType
      }
  }

  function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
          throwInternalError("Replacing nonexistant public symbol")
      }
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value
      } else {
          Module[name] = value;
          Module[name].argCount = numArguments
      }
  }

  function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);

      function makeDynCaller(dynCall) {
          var args = [];
          for (var i = 1; i < signature.length; ++i) {
              args.push("a" + i)
          }
          var name = "dynCall_" + signature + "_" + rawFunction;
          var body = "return function " + name + "(" + args.join(", ") + ") {\n";
          body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n";
          body += "};\n";
          return new Function("dynCall", "rawFunction", body)(dynCall, rawFunction)
      }
      var dc = Module["dynCall_" + signature];
      var fp = makeDynCaller(dc);
      if (typeof fp !== "function") {
          throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
      }
      return fp
  }
  var UnboundTypeError = undefined;

  function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv
  }

  function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};

      function visit(type) {
          if (seen[type]) {
              return
          }
          if (registeredTypes[type]) {
              return
          }
          if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return
          }
          unboundTypes.push(type);
          seen[type] = true
      }
      types.forEach(visit);
      throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
  }

  function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast)
      }
      if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast)
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
      exposePublicSymbol(legalFunctionName, function() {
          throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType])
      });
      whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
          base = base[0];
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype
          } else {
              basePrototype = ClassHandle.prototype
          }
          var constructor = createNamedFunction(legalFunctionName, function() {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                  throw new BindingError("Use 'new' to construct " + name)
              }
              if (undefined === registeredClass.constructor_body) {
                  throw new BindingError(name + " has no accessible constructor")
              }
              var body = registeredClass.constructor_body[arguments.length];
              if (undefined === body) {
                  throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!")
              }
              return body.apply(this, arguments)
          });
          var instancePrototype = Object.create(basePrototype, {
              constructor: {
                  value: constructor
              }
          });
          constructor.prototype = instancePrototype;
          var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
          var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
          var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
          var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
          registeredPointers[rawType] = {
              pointerType: pointerConverter,
              constPointerType: constPointerConverter
          };
          replacePublicSymbol(legalFunctionName, constructor);
          return [referenceConverter, pointerConverter, constPointerConverter]
      })
  }

  function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
          throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
      }
      var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {});
      dummy.prototype = constructor.prototype;
      var obj = new dummy;
      var r = constructor.apply(obj, argumentList);
      return r instanceof Object ? r : obj
  }

  function runDestructors(destructors) {
      while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr)
      }
  }

  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      var argCount = argTypes.length;
      if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i = 1; i < argTypes.length; ++i) {
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
              needsDestructorStack = true;
              break
          }
      }
      var returns = argTypes[0].name !== "void";
      var argsList = "";
      var argsListWired = "";
      for (var i = 0; i < argCount - 2; ++i) {
          argsList += (i !== 0 ? ", " : "") + "arg" + i;
          argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
      }
      var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
      if (needsDestructorStack) {
          invokerFnBody += "var destructors = [];\n"
      }
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
      if (isClassMethodFunc) {
          invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
      }
      for (var i = 0; i < argCount - 2; ++i) {
          invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
          args1.push("argType" + i);
          args2.push(argTypes[i + 2])
      }
      if (isClassMethodFunc) {
          argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
      }
      invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
      if (needsDestructorStack) {
          invokerFnBody += "runDestructors(destructors);\n"
      } else {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
              var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
              if (argTypes[i].destructorFunction !== null) {
                  invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                  args1.push(paramName + "_dtor");
                  args2.push(argTypes[i].destructorFunction)
              }
          }
      }
      if (returns) {
          invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
      } else {}
      invokerFnBody += "}\n";
      args1.push(invokerFnBody);
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction
  }

  function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
          array.push(HEAP32[(firstElement >> 2) + i])
      }
      return array
  }

  function __embind_register_class_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, fn) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = classType.name + "." + methodName;

          function unboundTypesHandler() {
              throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
          }
          var proto = classType.registeredClass.constructor;
          if (undefined === proto[methodName]) {
              unboundTypesHandler.argCount = argCount - 1;
              proto[methodName] = unboundTypesHandler
          } else {
              ensureOverloadTable(proto, methodName, humanName);
              proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler
          }
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
              var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
              var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn);
              if (undefined === proto[methodName].overloadTable) {
                  func.argCount = argCount - 1;
                  proto[methodName] = func
              } else {
                  proto[methodName].overloadTable[argCount - 1] = func
              }
              return []
          });
          return []
      })
  }

  function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = "constructor " + classType.name;
          if (undefined === classType.registeredClass.constructor_body) {
              classType.registeredClass.constructor_body = []
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
              throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!")
          }
          classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
              throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes)
          };
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
              classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                  if (arguments.length !== argCount - 1) {
                      throwBindingError(humanName + " called with " + arguments.length + " arguments, expected " + (argCount - 1))
                  }
                  destructors.length = 0;
                  args.length = argCount;
                  for (var i = 1; i < argCount; ++i) {
                      args[i] = argTypes[i]["toWireType"](destructors, arguments[i - 1])
                  }
                  var ptr = invoker.apply(null, args);
                  runDestructors(destructors);
                  return argTypes[0]["fromWireType"](ptr)
              };
              return []
          });
          return []
      })
  }

  function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = classType.name + "." + methodName;
          if (isPureVirtual) {
              classType.registeredClass.pureVirtualFunctions.push(methodName)
          }

          function unboundTypesHandler() {
              throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
          }
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
              unboundTypesHandler.argCount = argCount - 2;
              unboundTypesHandler.className = classType.name;
              proto[methodName] = unboundTypesHandler
          } else {
              ensureOverloadTable(proto, methodName, humanName);
              proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler
          }
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
              var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
              if (undefined === proto[methodName].overloadTable) {
                  memberFunction.argCount = argCount - 2;
                  proto[methodName] = memberFunction
              } else {
                  proto[methodName].overloadTable[argCount - 2] = memberFunction
              }
              return []
          });
          return []
      })
  }
  var emval_free_list = [];
  var emval_handle_array = [{}, {
      value: undefined
  }, {
      value: null
  }, {
      value: true
  }, {
      value: false
  }];

  function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle)
      }
  }

  function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              ++count
          }
      }
      return count
  }

  function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              return emval_handle_array[i]
          }
      }
      return null
  }

  function init_emval() {
      Module["count_emval_handles"] = count_emval_handles;
      Module["get_first_emval"] = get_first_emval
  }

  function __emval_register(value) {
      switch (value) {
          case undefined: {
              return 1
          }
          case null: {
              return 2
          }
          case true: {
              return 3
          }
          case false: {
              return 4
          }
          default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = {
                  refcount: 1,
                  value: value
              };
              return handle
          }
      }
  }

  function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          "fromWireType": function(handle) {
              var rv = emval_handle_array[handle].value;
              __emval_decref(handle);
              return rv
          },
          "toWireType": function(destructors, value) {
              return __emval_register(value)
          },
          "argPackAdvance": 8,
          "readValueFromPointer": simpleReadValueFromPointer,
          destructorFunction: null
      })
  }

  function _embind_repr(v) {
      if (v === null) {
          return "null"
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
          return v.toString()
      } else {
          return "" + v
      }
  }

  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2:
              return function(pointer) {
                  return this["fromWireType"](HEAPF32[pointer >> 2])
              };
          case 3:
              return function(pointer) {
                  return this["fromWireType"](HEAPF64[pointer >> 3])
              };
          default:
              throw new TypeError("Unknown float type: " + name)
      }
  }

  function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          "fromWireType": function(value) {
              return value
          },
          "toWireType": function(destructors, value) {
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
              }
              return value
          },
          "argPackAdvance": 8,
          "readValueFromPointer": floatReadValueFromPointer(name, shift),
          destructorFunction: null
      })
  }

  function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = readLatin1String(name);
      rawInvoker = embind__requireFunction(signature, rawInvoker);
      exposePublicSymbol(name, function() {
          throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes)
      }, argCount - 1);
      whenDependentTypesAreResolved([], argTypes, function(argTypes) {
          var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
          replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
          return []
      })
  }

  function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
          case 0:
              return signed ? function readS8FromPointer(pointer) {
                  return HEAP8[pointer]
              } : function readU8FromPointer(pointer) {
                  return HEAPU8[pointer]
              };
          case 1:
              return signed ? function readS16FromPointer(pointer) {
                  return HEAP16[pointer >> 1]
              } : function readU16FromPointer(pointer) {
                  return HEAPU16[pointer >> 1]
              };
          case 2:
              return signed ? function readS32FromPointer(pointer) {
                  return HEAP32[pointer >> 2]
              } : function readU32FromPointer(pointer) {
                  return HEAPU32[pointer >> 2]
              };
          default:
              throw new TypeError("Unknown integer type: " + name)
      }
  }

  function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      if (maxRange === -1) {
          maxRange = 4294967295
      }
      var shift = getShiftFromSize(size);
      var fromWireType = function(value) {
          return value
      };
      if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = function(value) {
              return value << bitshift >>> bitshift
          }
      }
      var isUnsignedType = name.indexOf("unsigned") != -1;
      registerType(primitiveType, {
          name: name,
          "fromWireType": fromWireType,
          "toWireType": function(destructors, value) {
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
              }
              if (value < minRange || value > maxRange) {
                  throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
              }
              return isUnsignedType ? value >>> 0 : value | 0
          },
          "argPackAdvance": 8,
          "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null
      })
  }

  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
      var TA = typeMapping[dataTypeIndex];

      function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle];
          var data = heap[handle + 1];
          return new TA(buffer, data, size)
      }
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          "fromWireType": decodeMemoryView,
          "argPackAdvance": 8,
          "readValueFromPointer": decodeMemoryView
      }, {
          ignoreDuplicateRegistrations: true
      })
  }

  function __embind_register_smart_ptr(rawType, rawPointeeType, name, sharingPolicy, getPointeeSignature, rawGetPointee, constructorSignature, rawConstructor, shareSignature, rawShare, destructorSignature, rawDestructor) {
      name = readLatin1String(name);
      rawGetPointee = embind__requireFunction(getPointeeSignature, rawGetPointee);
      rawConstructor = embind__requireFunction(constructorSignature, rawConstructor);
      rawShare = embind__requireFunction(shareSignature, rawShare);
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
          pointeeType = pointeeType[0];
          var registeredPointer = new RegisteredPointer(name, pointeeType.registeredClass, false, false, true, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor);
          return [registeredPointer]
      })
  }

  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, {
          name: name,
          "fromWireType": function(value) {
              var length = HEAPU32[value >> 2];
              var str;
              if (stdStringIsUTF8) {
                  var endChar = HEAPU8[value + 4 + length];
                  var endCharSwap = 0;
                  if (endChar != 0) {
                      endCharSwap = endChar;
                      HEAPU8[value + 4 + length] = 0
                  }
                  var decodeStartPtr = value + 4;
                  for (var i = 0; i <= length; ++i) {
                      var currentBytePtr = value + 4 + i;
                      if (HEAPU8[currentBytePtr] == 0) {
                          var stringSegment = UTF8ToString(decodeStartPtr);
                          if (str === undefined) {
                              str = stringSegment
                          } else {
                              str += String.fromCharCode(0);
                              str += stringSegment
                          }
                          decodeStartPtr = currentBytePtr + 1
                      }
                  }
                  if (endCharSwap != 0) {
                      HEAPU8[value + 4 + length] = endCharSwap
                  }
              } else {
                  var a = new Array(length);
                  for (var i = 0; i < length; ++i) {
                      a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                  }
                  str = a.join("")
              }
              _free(value);
              return str
          },
          "toWireType": function(destructors, value) {
              if (value instanceof ArrayBuffer) {
                  value = new Uint8Array(value)
              }
              var getLength;
              var valueIsOfTypeString = typeof value === "string";
              if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                  throwBindingError("Cannot pass non-string to std::string")
              }
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  getLength = function() {
                      return lengthBytesUTF8(value)
                  }
              } else {
                  getLength = function() {
                      return value.length
                  }
              }
              var length = getLength();
              var ptr = _malloc(4 + length + 1);
              HEAPU32[ptr >> 2] = length;
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  stringToUTF8(value, ptr + 4, length + 1)
              } else {
                  if (valueIsOfTypeString) {
                      for (var i = 0; i < length; ++i) {
                          var charCode = value.charCodeAt(i);
                          if (charCode > 255) {
                              _free(ptr);
                              throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                          }
                          HEAPU8[ptr + 4 + i] = charCode
                      }
                  } else {
                      for (var i = 0; i < length; ++i) {
                          HEAPU8[ptr + 4 + i] = value[i]
                      }
                  }
              }
              if (destructors !== null) {
                  destructors.push(_free, ptr)
              }
              return ptr
          },
          "argPackAdvance": 8,
          "readValueFromPointer": simpleReadValueFromPointer,
          destructorFunction: function(ptr) {
              _free(ptr)
          }
      })
  }

  function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          getHeap = function() {
              return HEAPU16
          };
          shift = 1
      } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          getHeap = function() {
              return HEAPU32
          };
          shift = 2
      }
      registerType(rawType, {
          name: name,
          "fromWireType": function(value) {
              var length = HEAPU32[value >> 2];
              var HEAP = getHeap();
              var str;
              var endChar = HEAP[value + 4 + length * charSize >> shift];
              var endCharSwap = 0;
              if (endChar != 0) {
                  endCharSwap = endChar;
                  HEAP[value + 4 + length * charSize >> shift] = 0
              }
              var decodeStartPtr = value + 4;
              for (var i = 0; i <= length; ++i) {
                  var currentBytePtr = value + 4 + i * charSize;
                  if (HEAP[currentBytePtr >> shift] == 0) {
                      var stringSegment = decodeString(decodeStartPtr);
                      if (str === undefined) {
                          str = stringSegment
                      } else {
                          str += String.fromCharCode(0);
                          str += stringSegment
                      }
                      decodeStartPtr = currentBytePtr + charSize
                  }
              }
              if (endCharSwap != 0) {
                  HEAP[value + 4 + length * charSize >> shift] = endCharSwap
              }
              _free(value);
              return str
          },
          "toWireType": function(destructors, value) {
              if (!(typeof value === "string")) {
                  throwBindingError("Cannot pass non-string to C++ string type " + name)
              }
              var length = lengthBytesUTF(value);
              var ptr = _malloc(4 + length + charSize);
              HEAPU32[ptr >> 2] = length >> shift;
              encodeString(value, ptr + 4, length + charSize);
              if (destructors !== null) {
                  destructors.push(_free, ptr)
              }
              return ptr
          },
          "argPackAdvance": 8,
          "readValueFromPointer": simpleReadValueFromPointer,
          destructorFunction: function(ptr) {
              _free(ptr)
          }
      })
  }

  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true,
          name: name,
          "argPackAdvance": 0,
          "fromWireType": function() {
              return undefined
          },
          "toWireType": function(destructors, o) {
              return undefined
          }
      })
  }

  function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
          throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
      }
      return impl
  }

  function __emval_lookupTypes(argCount, argTypes) {
      var a = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
          a[i] = requireRegisteredType(HEAP32[(argTypes >> 2) + i], "parameter " + i)
      }
      return a
  }

  function requireHandle(handle) {
      if (!handle) {
          throwBindingError("Cannot use deleted val. handle = " + handle)
      }
      return emval_handle_array[handle].value
  }

  function __emval_call(handle, argCount, argTypes, argv) {
      handle = requireHandle(handle);
      var types = __emval_lookupTypes(argCount, argTypes);
      var args = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
          var type = types[i];
          args[i] = type["readValueFromPointer"](argv);
          argv += type["argPackAdvance"]
      }
      var rv = handle.apply(undefined, args);
      return __emval_register(rv)
  }

  function __emval_incref(handle) {
      if (handle > 4) {
          emval_handle_array[handle].refcount += 1
      }
  }

  function __emval_take_value(type, argv) {
      type = requireRegisteredType(type, "_emval_take_value");
      var v = type["readValueFromPointer"](argv);
      return __emval_register(v)
  }

  function _abort() {
      abort()
  }

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return (Date.now() - _clock.start) * (1e6 / 1e3) | 0
  }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num)
  }

  function abortOnCannotGrowMemory(requestedSize) {
      abort("OOM")
  }

  function _emscripten_resize_heap(requestedSize) {
      abortOnCannotGrowMemory(requestedSize)
  }
  var ENV = {};

  function __getExecutableName() {
      return thisProgram || "./this.program"
  }

  function _emscripten_get_environ() {
      if (!_emscripten_get_environ.strings) {
          var env = {
              "USER": "web_user",
              "LOGNAME": "web_user",
              "PATH": "/",
              "PWD": "/",
              "HOME": "/home/web_user",
              "LANG": (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
              "_": __getExecutableName()
          };
          for (var x in ENV) {
              env[x] = ENV[x]
          }
          var strings = [];
          for (var x in env) {
              strings.push(x + "=" + env[x])
          }
          _emscripten_get_environ.strings = strings
      }
      return _emscripten_get_environ.strings
  }

  function _environ_get(__environ, environ_buf) {
      var strings = _emscripten_get_environ();
      var bufSize = 0;
      strings.forEach(function(string, i) {
          var ptr = environ_buf + bufSize;
          HEAP32[__environ + i * 4 >> 2] = ptr;
          writeAsciiToMemory(string, ptr);
          bufSize += string.length + 1
      });
      return 0
  }

  function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = _emscripten_get_environ();
      HEAP32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
          bufSize += string.length + 1
      });
      HEAP32[penviron_buf_size >> 2] = bufSize;
      return 0
  }

  function _fd_close(fd) {
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          FS.close(stream);
          return 0
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return e.errno
      }
  }

  function _fd_read(fd, iov, iovcnt, pnum) {
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = SYSCALLS.doReadv(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return e.errno
      }
  }

  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var HIGH_OFFSET = 4294967296;
          var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
          var DOUBLE_LIMIT = 9007199254740992;
          if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
              return -61
          }
          FS.llseek(stream, offset, whence);
          tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
          if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
          return 0
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return e.errno
      }
  }

  function _fd_write(fd, iov, iovcnt, pnum) {
      try {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var num = SYSCALLS.doWritev(stream, iov, iovcnt);
          HEAP32[pnum >> 2] = num;
          return 0
      } catch (e) {
          if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
          return e.errno
      }
  }

  function _getTempRet0() {
      return getTempRet0() | 0
  }

  function _llvm_eh_typeid_for(type) {
      return type
  }
  var ERRNO_CODES = {
      EPERM: 63,
      ENOENT: 44,
      ESRCH: 71,
      EINTR: 27,
      EIO: 29,
      ENXIO: 60,
      E2BIG: 1,
      ENOEXEC: 45,
      EBADF: 8,
      ECHILD: 12,
      EAGAIN: 6,
      EWOULDBLOCK: 6,
      ENOMEM: 48,
      EACCES: 2,
      EFAULT: 21,
      ENOTBLK: 105,
      EBUSY: 10,
      EEXIST: 20,
      EXDEV: 75,
      ENODEV: 43,
      ENOTDIR: 54,
      EISDIR: 31,
      EINVAL: 28,
      ENFILE: 41,
      EMFILE: 33,
      ENOTTY: 59,
      ETXTBSY: 74,
      EFBIG: 22,
      ENOSPC: 51,
      ESPIPE: 70,
      EROFS: 69,
      EMLINK: 34,
      EPIPE: 64,
      EDOM: 18,
      ERANGE: 68,
      ENOMSG: 49,
      EIDRM: 24,
      ECHRNG: 106,
      EL2NSYNC: 156,
      EL3HLT: 107,
      EL3RST: 108,
      ELNRNG: 109,
      EUNATCH: 110,
      ENOCSI: 111,
      EL2HLT: 112,
      EDEADLK: 16,
      ENOLCK: 46,
      EBADE: 113,
      EBADR: 114,
      EXFULL: 115,
      ENOANO: 104,
      EBADRQC: 103,
      EBADSLT: 102,
      EDEADLOCK: 16,
      EBFONT: 101,
      ENOSTR: 100,
      ENODATA: 116,
      ETIME: 117,
      ENOSR: 118,
      ENONET: 119,
      ENOPKG: 120,
      EREMOTE: 121,
      ENOLINK: 47,
      EADV: 122,
      ESRMNT: 123,
      ECOMM: 124,
      EPROTO: 65,
      EMULTIHOP: 36,
      EDOTDOT: 125,
      EBADMSG: 9,
      ENOTUNIQ: 126,
      EBADFD: 127,
      EREMCHG: 128,
      ELIBACC: 129,
      ELIBBAD: 130,
      ELIBSCN: 131,
      ELIBMAX: 132,
      ELIBEXEC: 133,
      ENOSYS: 52,
      ENOTEMPTY: 55,
      ENAMETOOLONG: 37,
      ELOOP: 32,
      EOPNOTSUPP: 138,
      EPFNOSUPPORT: 139,
      ECONNRESET: 15,
      ENOBUFS: 42,
      EAFNOSUPPORT: 5,
      EPROTOTYPE: 67,
      ENOTSOCK: 57,
      ENOPROTOOPT: 50,
      ESHUTDOWN: 140,
      ECONNREFUSED: 14,
      EADDRINUSE: 3,
      ECONNABORTED: 13,
      ENETUNREACH: 40,
      ENETDOWN: 38,
      ETIMEDOUT: 73,
      EHOSTDOWN: 142,
      EHOSTUNREACH: 23,
      EINPROGRESS: 26,
      EALREADY: 7,
      EDESTADDRREQ: 17,
      EMSGSIZE: 35,
      EPROTONOSUPPORT: 66,
      ESOCKTNOSUPPORT: 137,
      EADDRNOTAVAIL: 4,
      ENETRESET: 39,
      EISCONN: 30,
      ENOTCONN: 53,
      ETOOMANYREFS: 141,
      EUSERS: 136,
      EDQUOT: 19,
      ESTALE: 72,
      ENOTSUP: 138,
      ENOMEDIUM: 148,
      EILSEQ: 25,
      EOVERFLOW: 61,
      ECANCELED: 11,
      ENOTRECOVERABLE: 56,
      EOWNERDEAD: 62,
      ESTRPIPE: 135
  };

  function _raise(sig) {
      ___setErrNo(ERRNO_CODES.ENOSYS);
      return -1
  }

  function _setTempRet0($i) {
      setTempRet0($i | 0)
  }

  function __isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  }

  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {}
      return sum
  }
  var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
          var leap = __isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
          if (days > daysInCurrentMonth - newDate.getDate()) {
              days -= daysInCurrentMonth - newDate.getDate() + 1;
              newDate.setDate(1);
              if (currentMonth < 11) {
                  newDate.setMonth(currentMonth + 1)
              } else {
                  newDate.setMonth(0);
                  newDate.setFullYear(newDate.getFullYear() + 1)
              }
          } else {
              newDate.setDate(newDate.getDate() + days);
              return newDate
          }
      }
      return newDate
  }

  function _strftime(s, maxsize, format, tm) {
      var tm_zone = HEAP32[tm + 40 >> 2];
      var date = {
          tm_sec: HEAP32[tm >> 2],
          tm_min: HEAP32[tm + 4 >> 2],
          tm_hour: HEAP32[tm + 8 >> 2],
          tm_mday: HEAP32[tm + 12 >> 2],
          tm_mon: HEAP32[tm + 16 >> 2],
          tm_year: HEAP32[tm + 20 >> 2],
          tm_wday: HEAP32[tm + 24 >> 2],
          tm_yday: HEAP32[tm + 28 >> 2],
          tm_isdst: HEAP32[tm + 32 >> 2],
          tm_gmtoff: HEAP32[tm + 36 >> 2],
          tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
      };
      var pattern = UTF8ToString(format);
      var EXPANSION_RULES_1 = {
          "%c": "%a %b %d %H:%M:%S %Y",
          "%D": "%m/%d/%y",
          "%F": "%Y-%m-%d",
          "%h": "%b",
          "%r": "%I:%M:%S %p",
          "%R": "%H:%M",
          "%T": "%H:%M:%S",
          "%x": "%m/%d/%y",
          "%X": "%H:%M:%S",
          "%Ec": "%c",
          "%EC": "%C",
          "%Ex": "%m/%d/%y",
          "%EX": "%H:%M:%S",
          "%Ey": "%y",
          "%EY": "%Y",
          "%Od": "%d",
          "%Oe": "%e",
          "%OH": "%H",
          "%OI": "%I",
          "%Om": "%m",
          "%OM": "%M",
          "%OS": "%S",
          "%Ou": "%u",
          "%OU": "%U",
          "%OV": "%V",
          "%Ow": "%w",
          "%OW": "%W",
          "%Oy": "%y"
      };
      for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
      }
      var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      function leadingSomething(value, digits, character) {
          var str = typeof value === "number" ? value.toString() : value || "";
          while (str.length < digits) {
              str = character[0] + str
          }
          return str
      }

      function leadingNulls(value, digits) {
          return leadingSomething(value, digits, "0")
      }

      function compareByDay(date1, date2) {
          function sgn(value) {
              return value < 0 ? -1 : value > 0 ? 1 : 0
          }
          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
              if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                  compare = sgn(date1.getDate() - date2.getDate())
              }
          }
          return compare
      }

      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
              case 0:
                  return new Date(janFourth.getFullYear() - 1, 11, 29);
              case 1:
                  return janFourth;
              case 2:
                  return new Date(janFourth.getFullYear(), 0, 3);
              case 3:
                  return new Date(janFourth.getFullYear(), 0, 2);
              case 4:
                  return new Date(janFourth.getFullYear(), 0, 1);
              case 5:
                  return new Date(janFourth.getFullYear() - 1, 11, 31);
              case 6:
                  return new Date(janFourth.getFullYear() - 1, 11, 30)
          }
      }

      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
              if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                  return thisDate.getFullYear() + 1
              } else {
                  return thisDate.getFullYear()
              }
          } else {
              return thisDate.getFullYear() - 1
          }
      }
      var EXPANSION_RULES_2 = {
          "%a": function(date) {
              return WEEKDAYS[date.tm_wday].substring(0, 3)
          },
          "%A": function(date) {
              return WEEKDAYS[date.tm_wday]
          },
          "%b": function(date) {
              return MONTHS[date.tm_mon].substring(0, 3)
          },
          "%B": function(date) {
              return MONTHS[date.tm_mon]
          },
          "%C": function(date) {
              var year = date.tm_year + 1900;
              return leadingNulls(year / 100 | 0, 2)
          },
          "%d": function(date) {
              return leadingNulls(date.tm_mday, 2)
          },
          "%e": function(date) {
              return leadingSomething(date.tm_mday, 2, " ")
          },
          "%g": function(date) {
              return getWeekBasedYear(date).toString().substring(2)
          },
          "%G": function(date) {
              return getWeekBasedYear(date)
          },
          "%H": function(date) {
              return leadingNulls(date.tm_hour, 2)
          },
          "%I": function(date) {
              var twelveHour = date.tm_hour;
              if (twelveHour == 0) twelveHour = 12;
              else if (twelveHour > 12) twelveHour -= 12;
              return leadingNulls(twelveHour, 2)
          },
          "%j": function(date) {
              return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
          },
          "%m": function(date) {
              return leadingNulls(date.tm_mon + 1, 2)
          },
          "%M": function(date) {
              return leadingNulls(date.tm_min, 2)
          },
          "%n": function() {
              return "\n"
          },
          "%p": function(date) {
              if (date.tm_hour >= 0 && date.tm_hour < 12) {
                  return "AM"
              } else {
                  return "PM"
              }
          },
          "%S": function(date) {
              return leadingNulls(date.tm_sec, 2)
          },
          "%t": function() {
              return "\t"
          },
          "%u": function(date) {
              return date.tm_wday || 7
          },
          "%U": function(date) {
              var janFirst = new Date(date.tm_year + 1900, 0, 1);
              var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
              var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
              if (compareByDay(firstSunday, endDate) < 0) {
                  var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                  var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                  var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                  return leadingNulls(Math.ceil(days / 7), 2)
              }
              return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
          },
          "%V": function(date) {
              var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
              var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
              var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
              var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
              var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
              if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                  return "53"
              }
              if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                  return "01"
              }
              var daysDifference;
              if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                  daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
              } else {
                  daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
              }
              return leadingNulls(Math.ceil(daysDifference / 7), 2)
          },
          "%w": function(date) {
              return date.tm_wday
          },
          "%W": function(date) {
              var janFirst = new Date(date.tm_year, 0, 1);
              var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
              var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
              if (compareByDay(firstMonday, endDate) < 0) {
                  var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                  var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                  var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                  return leadingNulls(Math.ceil(days / 7), 2)
              }
              return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
          },
          "%y": function(date) {
              return (date.tm_year + 1900).toString().substring(2)
          },
          "%Y": function(date) {
              return date.tm_year + 1900
          },
          "%z": function(date) {
              var off = date.tm_gmtoff;
              var ahead = off >= 0;
              off = Math.abs(off) / 60;
              off = off / 60 * 100 + off % 60;
              return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
          },
          "%Z": function(date) {
              return date.tm_zone
          },
          "%%": function() {
              return "%"
          }
      };
      for (var rule in EXPANSION_RULES_2) {
          if (pattern.indexOf(rule) >= 0) {
              pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
          }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
          return 0
      }
      writeArrayToMemory(bytes, s);
      return bytes.length - 1
  }

  function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm)
  }
  var FSNode = function(parent, name, mode, rdev) {
      if (!parent) {
          parent = this
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.mounted = null;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.node_ops = {};
      this.stream_ops = {};
      this.rdev = rdev
  };
  var readMode = 292 | 73;
  var writeMode = 146;
  Object.defineProperties(FSNode.prototype, {
      read: {
          get: function() {
              return (this.mode & readMode) === readMode
          },
          set: function(val) {
              val ? this.mode |= readMode : this.mode &= ~readMode
          }
      },
      write: {
          get: function() {
              return (this.mode & writeMode) === writeMode
          },
          set: function(val) {
              val ? this.mode |= writeMode : this.mode &= ~writeMode
          }
      },
      isFolder: {
          get: function() {
              return FS.isDir(this.mode)
          }
      },
      isDevice: {
          get: function() {
              return FS.isChrdev(this.mode)
          }
      }
  });
  FS.FSNode = FSNode;
  FS.staticInit();
  embind_init_charCodes();
  BindingError = Module["BindingError"] = extendError(Error, "BindingError");
  InternalError = Module["InternalError"] = extendError(Error, "InternalError");
  init_ClassHandle();
  init_RegisteredPointer();
  init_embind();
  UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
  init_emval();

  function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array
  }
  var asmLibraryArg = {
      "k": ___cxa_allocate_exception,
      "t": ___cxa_begin_catch,
      "F": ___cxa_end_catch,
      "b": ___cxa_find_matching_catch_2,
      "h": ___cxa_find_matching_catch_3,
      "p": ___cxa_find_matching_catch_4,
      "m": ___cxa_free_exception,
      "Y": ___cxa_rethrow,
      "r": ___cxa_throw,
      "oa": ___cxa_uncaught_exceptions,
      "la": ___map_file,
      "d": ___resumeException,
      "X": ___syscall221,
      "ra": ___syscall5,
      "qa": ___syscall54,
      "ka": ___syscall91,
      "ha": __embind_register_bool,
      "K": __embind_register_class,
      "D": __embind_register_class_class_function,
      "I": __embind_register_class_constructor,
      "q": __embind_register_class_function,
      "ga": __embind_register_emval,
      "R": __embind_register_float,
      "H": __embind_register_function,
      "z": __embind_register_integer,
      "v": __embind_register_memory_view,
      "J": __embind_register_smart_ptr,
      "S": __embind_register_std_string,
      "P": __embind_register_std_wstring,
      "ia": __embind_register_void,
      "B": __emval_call,
      "ta": __emval_decref,
      "ua": __emval_incref,
      "va": __emval_take_value,
      "A": _abort,
      "l": _clock,
      "ea": _emscripten_memcpy_big,
      "fa": _emscripten_resize_heap,
      "ma": _environ_get,
      "na": _environ_sizes_get,
      "W": _fd_close,
      "pa": _fd_read,
      "_": _fd_seek,
      "V": _fd_write,
      "a": _getTempRet0,
      "T": invoke_diii,
      "U": invoke_fiii,
      "s": invoke_i,
      "c": invoke_ii,
      "f": invoke_iii,
      "n": invoke_iiii,
      "j": invoke_iiiii,
      "w": invoke_iiiiii,
      "x": invoke_iiiiiii,
      "G": invoke_iiiiiiii,
      "N": invoke_iiiiiiiiiiii,
      "ca": invoke_iij,
      "da": invoke_ji,
      "aa": invoke_jii,
      "Z": invoke_jiiii,
      "o": invoke_v,
      "e": invoke_vi,
      "g": invoke_vii,
      "i": invoke_viii,
      "y": invoke_viiii,
      "O": invoke_viiiii,
      "E": invoke_viiiiii,
      "u": invoke_viiiiiii,
      "C": invoke_viiiiiiiiii,
      "M": invoke_viiiiiiiiiiiiiii,
      "ba": invoke_viiiij,
      "$": invoke_viij,
      "Q": _llvm_eh_typeid_for,
      "memory": wasmMemory,
      "sa": _raise,
      "L": _setTempRet0,
      "ja": _strftime_l,
      "table": wasmTable
  };
  var asm = createWasm();
  Module["asm"] = asm;
  var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
      return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["wa"]).apply(null, arguments)
  };
  var _malloc = Module["_malloc"] = function() {
      return (_malloc = Module["_malloc"] = Module["asm"]["xa"]).apply(null, arguments)
  };
  var _free = Module["_free"] = function() {
      return (_free = Module["_free"] = Module["asm"]["ya"]).apply(null, arguments)
  };
  var _main = Module["_main"] = function() {
      return (_main = Module["_main"] = Module["asm"]["za"]).apply(null, arguments)
  };
  var ___errno_location = Module["___errno_location"] = function() {
      return (___errno_location = Module["___errno_location"] = Module["asm"]["Aa"]).apply(null, arguments)
  };
  var _setThrew = Module["_setThrew"] = function() {
      return (_setThrew = Module["_setThrew"] = Module["asm"]["Ba"]).apply(null, arguments)
  };
  var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = function() {
      return (__ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = Module["asm"]["Ca"]).apply(null, arguments)
  };
  var ___cxa_can_catch = Module["___cxa_can_catch"] = function() {
      return (___cxa_can_catch = Module["___cxa_can_catch"] = Module["asm"]["Da"]).apply(null, arguments)
  };
  var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = function() {
      return (___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = Module["asm"]["Ea"]).apply(null, arguments)
  };
  var ___getTypeName = Module["___getTypeName"] = function() {
      return (___getTypeName = Module["___getTypeName"] = Module["asm"]["Fa"]).apply(null, arguments)
  };
  var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function() {
      return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["Ga"]).apply(null, arguments)
  };
  var dynCall_v = Module["dynCall_v"] = function() {
      return (dynCall_v = Module["dynCall_v"] = Module["asm"]["Ha"]).apply(null, arguments)
  };
  var dynCall_vi = Module["dynCall_vi"] = function() {
      return (dynCall_vi = Module["dynCall_vi"] = Module["asm"]["Ia"]).apply(null, arguments)
  };
  var dynCall_vii = Module["dynCall_vii"] = function() {
      return (dynCall_vii = Module["dynCall_vii"] = Module["asm"]["Ja"]).apply(null, arguments)
  };
  var dynCall_viii = Module["dynCall_viii"] = function() {
      return (dynCall_viii = Module["dynCall_viii"] = Module["asm"]["Ka"]).apply(null, arguments)
  };
  var dynCall_viiii = Module["dynCall_viiii"] = function() {
      return (dynCall_viiii = Module["dynCall_viiii"] = Module["asm"]["La"]).apply(null, arguments)
  };
  var dynCall_viiiii = Module["dynCall_viiiii"] = function() {
      return (dynCall_viiiii = Module["dynCall_viiiii"] = Module["asm"]["Ma"]).apply(null, arguments)
  };
  var dynCall_viiiiii = Module["dynCall_viiiiii"] = function() {
      return (dynCall_viiiiii = Module["dynCall_viiiiii"] = Module["asm"]["Na"]).apply(null, arguments)
  };
  var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = function() {
      return (dynCall_viiiiiii = Module["dynCall_viiiiiii"] = Module["asm"]["Oa"]).apply(null, arguments)
  };
  var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = function() {
      return (dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = Module["asm"]["Pa"]).apply(null, arguments)
  };
  var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = function() {
      return (dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = Module["asm"]["Qa"]).apply(null, arguments)
  };
  var dynCall_viiiij = Module["dynCall_viiiij"] = function() {
      return (dynCall_viiiij = Module["dynCall_viiiij"] = Module["asm"]["Ra"]).apply(null, arguments)
  };
  var dynCall_viij = Module["dynCall_viij"] = function() {
      return (dynCall_viij = Module["dynCall_viij"] = Module["asm"]["Sa"]).apply(null, arguments)
  };
  var dynCall_i = Module["dynCall_i"] = function() {
      return (dynCall_i = Module["dynCall_i"] = Module["asm"]["Ta"]).apply(null, arguments)
  };
  var dynCall_ii = Module["dynCall_ii"] = function() {
      return (dynCall_ii = Module["dynCall_ii"] = Module["asm"]["Ua"]).apply(null, arguments)
  };
  var dynCall_iii = Module["dynCall_iii"] = function() {
      return (dynCall_iii = Module["dynCall_iii"] = Module["asm"]["Va"]).apply(null, arguments)
  };
  var dynCall_iiii = Module["dynCall_iiii"] = function() {
      return (dynCall_iiii = Module["dynCall_iiii"] = Module["asm"]["Wa"]).apply(null, arguments)
  };
  var dynCall_iiiii = Module["dynCall_iiiii"] = function() {
      return (dynCall_iiiii = Module["dynCall_iiiii"] = Module["asm"]["Xa"]).apply(null, arguments)
  };
  var dynCall_iiiiii = Module["dynCall_iiiiii"] = function() {
      return (dynCall_iiiiii = Module["dynCall_iiiiii"] = Module["asm"]["Ya"]).apply(null, arguments)
  };
  var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = function() {
      return (dynCall_iiiiiii = Module["dynCall_iiiiiii"] = Module["asm"]["Za"]).apply(null, arguments)
  };
  var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = function() {
      return (dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = Module["asm"]["_a"]).apply(null, arguments)
  };
  var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = function() {
      return (dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = Module["asm"]["$a"]).apply(null, arguments)
  };
  var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = function() {
      return (dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = Module["asm"]["ab"]).apply(null, arguments)
  };
  var dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = function() {
      return (dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = Module["asm"]["bb"]).apply(null, arguments)
  };
  var dynCall_iij = Module["dynCall_iij"] = function() {
      return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["cb"]).apply(null, arguments)
  };
  var dynCall_ji = Module["dynCall_ji"] = function() {
      return (dynCall_ji = Module["dynCall_ji"] = Module["asm"]["db"]).apply(null, arguments)
  };
  var dynCall_jii = Module["dynCall_jii"] = function() {
      return (dynCall_jii = Module["dynCall_jii"] = Module["asm"]["eb"]).apply(null, arguments)
  };
  var dynCall_jiiii = Module["dynCall_jiiii"] = function() {
      return (dynCall_jiiii = Module["dynCall_jiiii"] = Module["asm"]["fb"]).apply(null, arguments)
  };
  var dynCall_fiii = Module["dynCall_fiii"] = function() {
      return (dynCall_fiii = Module["dynCall_fiii"] = Module["asm"]["gb"]).apply(null, arguments)
  };
  var dynCall_diii = Module["dynCall_diii"] = function() {
      return (dynCall_diii = Module["dynCall_diii"] = Module["asm"]["hb"]).apply(null, arguments)
  };
  var stackSave = Module["stackSave"] = function() {
      return (stackSave = Module["stackSave"] = Module["asm"]["ib"]).apply(null, arguments)
  };
  var stackAlloc = Module["stackAlloc"] = function() {
      return (stackAlloc = Module["stackAlloc"] = Module["asm"]["jb"]).apply(null, arguments)
  };
  var stackRestore = Module["stackRestore"] = function() {
      return (stackRestore = Module["stackRestore"] = Module["asm"]["kb"]).apply(null, arguments)
  };
  var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = function() {
      return (dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = Module["asm"]["lb"]).apply(null, arguments)
  };
  var dynCall_viijii = Module["dynCall_viijii"] = function() {
      return (dynCall_viijii = Module["dynCall_viijii"] = Module["asm"]["mb"]).apply(null, arguments)
  };
  var dynCall_jiji = Module["dynCall_jiji"] = function() {
      return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["nb"]).apply(null, arguments)
  };
  var dynCall_iidiiii = Module["dynCall_iidiiii"] = function() {
      return (dynCall_iidiiii = Module["dynCall_iidiiii"] = Module["asm"]["ob"]).apply(null, arguments)
  };
  var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = function() {
      return (dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = Module["asm"]["pb"]).apply(null, arguments)
  };
  var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
      return (dynCall_iiiiij = Module["dynCall_iiiiij"] = Module["asm"]["qb"]).apply(null, arguments)
  };
  var dynCall_iiiiid = Module["dynCall_iiiiid"] = function() {
      return (dynCall_iiiiid = Module["dynCall_iiiiid"] = Module["asm"]["rb"]).apply(null, arguments)
  };
  var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = function() {
      return (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = Module["asm"]["sb"]).apply(null, arguments)
  };
  var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = function() {
      return (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = Module["asm"]["tb"]).apply(null, arguments)
  };

  function invoke_vi(index, a1) {
      var sp = stackSave();
      try {
          dynCall_vi(index, a1)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_ii(index, a1) {
      var sp = stackSave();
      try {
          return dynCall_ii(index, a1)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iii(index, a1, a2) {
      var sp = stackSave();
      try {
          return dynCall_iii(index, a1, a2)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
          dynCall_viii(index, a1, a2, a3)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
          return dynCall_iiiii(index, a1, a2, a3, a4)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
          return dynCall_iiii(index, a1, a2, a3)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
          dynCall_vii(index, a1, a2)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_v(index) {
      var sp = stackSave();
      try {
          dynCall_v(index)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
          return dynCall_iiiiii(index, a1, a2, a3, a4, a5)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
          dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
          dynCall_viiii(index, a1, a2, a3, a4)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
          return dynCall_iiiiiii(index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiii(index, a1, a2, a3, a4, a5) {
      var sp = stackSave();
      try {
          dynCall_viiiii(index, a1, a2, a3, a4, a5)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
          dynCall_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
      var sp = stackSave();
      try {
          return dynCall_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_fiii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
          return dynCall_fiii(index, a1, a2, a3)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_diii(index, a1, a2, a3) {
      var sp = stackSave();
      try {
          return dynCall_diii(index, a1, a2, a3)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_i(index) {
      var sp = stackSave();
      try {
          return dynCall_i(index)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
      var sp = stackSave();
      try {
          return dynCall_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
      var sp = stackSave();
      try {
          dynCall_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
      var sp = stackSave();
      try {
          dynCall_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_ji(index, a1) {
      var sp = stackSave();
      try {
          return dynCall_ji(index, a1)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_iij(index, a1, a2, a3) {
      var sp = stackSave();
      try {
          return dynCall_iij(index, a1, a2, a3)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viiiij(index, a1, a2, a3, a4, a5, a6) {
      var sp = stackSave();
      try {
          dynCall_viiiij(index, a1, a2, a3, a4, a5, a6)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_jii(index, a1, a2) {
      var sp = stackSave();
      try {
          return dynCall_jii(index, a1, a2)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_viij(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
          dynCall_viij(index, a1, a2, a3, a4)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }

  function invoke_jiiii(index, a1, a2, a3, a4) {
      var sp = stackSave();
      try {
          return dynCall_jiiii(index, a1, a2, a3, a4)
      } catch (e) {
          stackRestore(sp);
          if (e !== e + 0 && e !== "longjmp") throw e;
          _setThrew(1, 0)
      }
  }
  Module["asm"] = asm;
  Module["ccall"] = ccall;
  Module["cwrap"] = cwrap;
  var calledRun;

  function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status
  }
  var calledMain = false;
  dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller
  };

  function callMain(args) {
      var entryFunction = Module["_main"];
      args = args || [];
      var argc = args.length + 1;
      var argv = stackAlloc((argc + 1) * 4);
      HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
      for (var i = 1; i < argc; i++) {
          HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
      }
      HEAP32[(argv >> 2) + argc] = 0;
      try {
          var ret = entryFunction(argc, argv);
          exit(ret, true)
      } catch (e) {
          if (e instanceof ExitStatus) {
              return
          } else if (e == "unwind") {
              noExitRuntime = true;
              return
          } else {
              var toLog = e;
              if (e && typeof e === "object" && e.stack) {
                  toLog = [e, e.stack]
              }
              err("exception thrown: " + toLog);
              quit_(1, e)
          }
      } finally {
          calledMain = true
      }
  }

  function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
          return
      }
      preRun();
      if (runDependencies > 0) return;

      function doRun() {
          if (calledRun) return;
          calledRun = true;
          Module["calledRun"] = true;
          if (ABORT) return;
          initRuntime();
          preMain();
          if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
          if (shouldRunNow) callMain(args);
          postRun()
      }
      if (Module["setStatus"]) {
          Module["setStatus"]("Running...");
          setTimeout(function() {
              setTimeout(function() {
                  Module["setStatus"]("")
              }, 1);
              doRun()
          }, 1)
      } else {
          doRun()
      }
  }
  Module["run"] = run;

  function exit(status, implicit) {
      if (implicit && noExitRuntime && status === 0) {
          return
      }
      if (noExitRuntime) {} else {
          ABORT = true;
          EXITSTATUS = status;
          exitRuntime();
          if (Module["onExit"]) Module["onExit"](status)
      }
      quit_(status, new ExitStatus(status))
  }
  if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
          Module["preInit"].pop()()
      }
  }
  var shouldRunNow = true;
  if (Module["noInitialRun"]) shouldRunNow = false;
  noExitRuntime = true;
  run();

  Module._initialized = true;
}
function isReadyPromise(resolve) {
  function onRuntimeInitialized() {
    Module.isInitialized = true;
    resolve(true);
  }
  Module.onRuntimeInitialized = onRuntimeInitialized;
}
Module.isReady = new Promise(isReadyPromise);
Module._init = _init;
Module.init = () => {
  if (Module.__initialized) return Module.isReady;
  Module.__initialized = true;
  Module._init();
  return Module.isReady;
};

module.exports = Module;
