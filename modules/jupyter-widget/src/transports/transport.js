class Transport {

  static registerTransport(transport) {}
  static getDefaultTransport() { return null; }
  static getTransport(name, fallback = true) { return null; }
  
  setCallbacks({onInitialize, onFinalize, onMessage}) {
    this.onInitialize = onInitialize;
    this.onFinalize = onFinalize;
    this.onMessage = onMessage;
    this.userData = {};
  }

  sendJSONMessage() {}
  sendBinaryMessage() {}

  // initialize() { return _loadPromise; }
};
