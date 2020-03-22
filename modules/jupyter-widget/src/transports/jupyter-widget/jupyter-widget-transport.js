// Jupyter Widget based Transport implementation

import Transport from '../transport';

class WidgetTransport extends Transport {
  constructor(widget) {
    this.widget = widget;
    // this.json = ;
    // this.dataBuffer = ;

    this.model.on('change:json_input', this._onJsonChanged.bind(this), this);
    this.model.on('change:data_buffer', this._onDataBufferChanged.bind(this), this);

    this._initPromise = new Promise((resolve, reject) => {
      this._resolveInitPromise = resolve;
      this._rejectInitPromise = reject;
    });
  }

  async initialize() {
    return this._initPromise;
  }

  finalize() {
    this._destroyed = true;
  }

  getSetting(key) {
    this.widget.model.get(key);
  }

  update(update) {
    this._loadPromise.then(() => {
      if (!this._destroyed) {
        this.onUpdate(update);
      }
    });
  }

  // PRIVATE

  /**
   * Called by the ipywidget when initialization is done
   * Resolves init promise and calls `onTransportInitialized`
   * @param {any} widget
   */
  _onWidgetInitialized(widget) {
    this._resolveInitPromise(this);
    this.props.onTransportInitialized(this);
  }

  _onDataBufferChanged() {
    if (this.widget.model.get('data_buffer')) {
      const propsWithBinary = processDataBuffer({
        dataBuffer: this.model.get('data_buffer'),
        jsonProps: this.model.get('json_input')
      });

      this.queueUpdate(propsWithBinary);
    }
  }

  _onJsonChanged() {
    const json = JSON.parse(this.model.get('json_input'));
    this.transport.onMessage({type: 'json', data: json});
  }
}
