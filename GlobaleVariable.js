class GlobalVariables {
    constructor() {
      this._globalString = '';
    }
  
    get globalString() {
      return this._globalString;
    }
  
    set globalString(value) {
      this._globalString = value;
    }
  }
  
export default new GlobalVariables();
  