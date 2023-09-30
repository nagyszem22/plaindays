class AppwriteVueException extends Error {
  code: number;
  response: string;
  type: string;
  constructor(message: string, code: number = 0, type: string = '', response: string = '') {
    super(message);
    this.name = 'AppwriteVueException';
    this.message = message;
    this.code = code;
    this.type = type;
    this.response = response;
  }
}

export { AppwriteVueException };