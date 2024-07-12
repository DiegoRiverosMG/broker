export class UtilService {

  public static indexName: number = 0;

  public static getControlName() {

    UtilService.indexName++;

    return 'name-' + new Date().getTime() + new Date().getUTCMilliseconds() + '-' + UtilService.indexName;
  }

  public static copy(object, target?) {
    if (target) {
      return Object.assign(target, object);
    }
    if (object === undefined || object === null || object === '') {
      return object;
    }
    return JSON.parse(JSON.stringify(object));
  }

  public static dates: any = {
    getCurrentDate: () => {
      let date = new Date();
      let day = date.getDate().toString();
      let month = (date.getMonth() + 1).toString();
      let year = date.getFullYear();

      if (Number(day) < 10) {
        day = '0' + day;
      }
      if (Number(month) < 10) {
        month = '0' + month;
      }

      return `${day}/${month}/${year}`;
    }
  };

  public static getProperty(object: any = {}, fields: any = '') { // fields = 'campo1.campo11.campo111'
    object = object || {};
    let _fields = (fields || '').split('.'),
      value;
    if (_fields.length > 1) {
      let field = _fields[0];
      _fields.splice(0, 1);
      value = UtilService.getProperty(object[field], _fields.join('.'));
    } else if (_fields.length == 1 && !!fields) {
      value = object[_fields[0]];
    } else {
      value = object;
    }
    return value === false ? false : (value || '');
  }
}
