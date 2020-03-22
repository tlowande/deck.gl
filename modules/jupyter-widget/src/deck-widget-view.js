/* global document */
import {DOMWidgetModel, DOMWidgetView} from '@jupyter-widgets/base';

import {jsonConverter, createDeck, updateDeck} from './create-deck';
import {deserializeMatrix, processDataBuffer} from './binary-transport';

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css';
const ERROR_BOX_CLASSNAME = 'error-box';


export class DeckGLView extends DOMWidgetView {
  initialize() {
    this.listenTo(this.model, 'destroy', this.remove);

    const customLibraries = this.model.get('custom_libraries');

    const container = document.createElement('div');

    this.el.appendChild(container);

    const height = `${this.model.get('height')}px`;
    const width = Number.isFinite(this.model.get('width'))
      ? `${this.model.get('width')}px`
      : this.model.get('width');
    container.style.width = width;
    container.style.height = height;
    container.style.position = 'relative';

    const mapboxApiKey = this.model.get('mapbox_key');
    const jsonInput = JSON.parse(this.model.get('json_input'));
    const tooltip = this.model.get('tooltip');

    if (this.model.get('js_warning')) {
      const errorBox = addErrorBox();
      container.append(errorBox);
    }

    loadCss(MAPBOX_CSS_URL);

    WidgetTransport._onWidgetInitialized(this);

    this.deck = createDeck({
      mapboxApiKey,
      container,
      jsonInput,
      tooltip,
      handleClick: this.handleClick.bind(this),
      handleWarning: this.handleWarning.bind(this),
      customLibraries
    });
  }

  remove() {
    if (this.transport) {
      this.transport.finalize();
      this.transport = null;
    }
  }

  render() {
    super.render();

    this.model.on('change:json_input', this.valueChanged.bind(this), this);
    this.model.on('change:data_buffer', this.dataBufferChanged.bind(this), this);

    this.dataBufferChanged();
  }

  dataBufferChanged() {
    if (this.model.get('data_buffer') && this.model.get('json_input')) {
      const convertedJson = jsonConverter.convert(this.model.get('json_input'));
      const propsWithBinary = processDataBuffer({
        dataBuffer: this.model.get('data_buffer'),
        convertedJson
      });
      this.deck.setProps(propsWithBinary);
    }
  }

  valueChanged() {
    const json = JSON.parse(this.model.get('json_input'));
    this.transport.onMessage({type: 'json', data: json});
  }

  handleClick(datum, e) {
    if (!datum || !datum.object) {
      this.model.set('selected_data', JSON.stringify(''));
      this.model.save_changes();
      return;
    }
    const multiselectEnabled = e.srcEvent.metaKey || e.srcEvent.metaKey;
    const dataPayload = datum.object && datum.object.points ? datum.object.points : datum.object;
    if (multiselectEnabled) {
      let selectedData = JSON.parse(this.model.get('selected_data'));
      if (!Array.isArray(selectedData)) {
        selectedData = [];
      }
      selectedData.push(dataPayload);
      this.model.set('selected_data', JSON.stringify(selectedData));
    } else {
      // Single selection
      this.model.set('selected_data', JSON.stringify(dataPayload));
    }
    this.model.save_changes();
  }

  handleWarning(warningMessage) {
    const errorBox = this.el.getElementsByClassName(ERROR_BOX_CLASSNAME)[0];
    if (this.model.get('js_warning') && errorBox) {
      errorBox.innerText = warningMessage;
    }
  }
}

function addErrorBox() {
  const errorBox = document.createElement('div');
  errorBox.className = ERROR_BOX_CLASSNAME;
  Object.assign(errorBox.style, {
    width: '100%',
    height: '20px',
    position: 'absolute',
    zIndex: '1000',
    backgroundColor: 'lemonchiffon',
    cursor: 'pointer'
  });
  errorBox.onclick = e => {
    errorBox.style.display = 'none';
  };
  return errorBox;
}

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}
