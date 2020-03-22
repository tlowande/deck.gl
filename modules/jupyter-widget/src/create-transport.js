import {jupyterWidgetTransport} from '../transport/jupyter-widget/jupyter-widget-transport';

import {jsonConverter, createDeck, updateDeck} from './create-deck';

const transport = jupyterWidgetTransport;

transport.setCallbacks({
  // TODO: hack we are accessing model directly
  onInitialize: ({transport, model}) => {
    const customLibraries = model.get('custom_libraries');

    const container = document.createElement('div');

    this.el.appendChild(container);

    const height = `${model.get('height')}px`;
    const width = Number.isFinite(model.get('width'))
      ? `${model.get('width')}px`
      : model.get('width');
    container.style.width = width;
    container.style.height = height;
    container.style.position = 'relative';

    const mapboxApiKey = model.get('mapbox_key');
    const jsonInput = JSON.parse(model.get('json_input'));
    const tooltip = model.get('tooltip');

    if (model.get('js_warning')) {
      const errorBox = addErrorBox();
      container.append(errorBox);
    }

    loadCss(MAPBOX_CSS_URL);

    transport.userData.deck = createDeck({
      mapboxApiKey,
      container,
      jsonInput,
      tooltip,
      handleClick: this.handleClick.bind(this),
      handleWarning: this.handleWarning.bind(this),
      customLibraries
    });
  },

  onFinalize: () => {
    this.deck.finalize();
  },

  onMessage: ({transport, type, message}) => {
    switch (type) {
      case 'json':
        // updateDeck(, this.deck);

        // const convertedJson = jsonConverter.convert(update);
        // this.deck.setProps(convertedJson);
    
        // Jupyter notebook displays an error that this suppresses
        hideMapboxCSSWarning();
        break;

      case 'json-with-binary':
        const convertedJson = jsonConverter.convert(message.json));
        const propsWithBinary = processDataBuffer({
          message.binary,
          message.json
        });
        transport.userData.deck.setProps(propsWithBinary);
        break;
      }
  }
});
