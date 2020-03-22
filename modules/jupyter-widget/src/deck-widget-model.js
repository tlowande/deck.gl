import {MODULE_NAME, MODULE_VERSION} from './version';

/**
 *
 * Note: Variables shared explictly between Python and JavaScript use snake_case
 */
export class DeckWidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: DeckWidgetModel.model_name,
      _model_module: DeckWidgetModel.model_module,
      _model_module_version: DeckWidgetModel.model_module_version,
      _view_name: DeckWidgetModel.view_name,
      _view_module: DeckWidgetModel.view_module,
      _view_module_version: DeckWidgetModel.view_module_version,
      custom_libraries: [],
      json_input: null,
      mapbox_key: null,
      selected_data: [],
      data_buffer: null,
      tooltip: null,
      width: '100%',
      height: 500,
      js_warning: false
    };
  }

  static get serializers() {
    return {
      ...DOMWidgetModel.serializers,
      // Add any extra serializers here
      data_buffer: {deserialize: deserializeMatrix}
    };
  }

  static get model_name() {
    return 'DeckWidgetModel';
  }
  static get model_module() {
    return MODULE_NAME;
  }
  static get model_module_version() {
    return MODULE_VERSION;
  }
  static get view_name() {
    return 'DeckGLView';
  }
  static get view_module() {
    return MODULE_NAME;
  }
  static get view_module_version() {
    return MODULE_VERSION;
  }
}
